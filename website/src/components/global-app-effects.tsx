"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function isAuthenticated() {
  const res = await fetch("/api/me", { credentials: "include" });
  return res.ok;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.register("/service-worker.js");
  await navigator.serviceWorker.ready;
  return registration;
}

async function postSubscription(subscription: PushSubscription) {
  const payload = subscription.toJSON();
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      ...payload,
      userAgent: navigator.userAgent,
    }),
  });
}

async function ensurePushSubscription() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return;

  const registration = await registerServiceWorker();
  if (!registration) return;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  await postSubscription(subscription);
}

export function GlobalAppEffects() {
  const router = useRouter();
  const seenAlarmIdsRef = useRef<Set<number>>(new Set());
  const alarmStreamUrl = useMemo(() => "/api/alarms/stream", []);

  useEffect(() => {
    const eventSource = new EventSource(alarmStreamUrl);

    const onAlarm = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as {
          id: number;
          lieu: string;
          type: string;
          valeur: number | null;
          unite: string | null;
        };

        if (seenAlarmIdsRef.current.has(data.id)) return;
        seenAlarmIdsRef.current.add(data.id);

        const labelType =
          data.type === "H" ? "Alarme haute" : data.type === "B" ? "Alarme basse" : "Alarme";
        const value = data.valeur === null ? "N/A" : `${data.valeur}${data.unite ?? "°C"}`;

        toast.error(`${labelType} - ${data.lieu}`, {
          description: `Valeur: ${value}`,
          action: {
            label: "Voir",
            onClick: () => router.push("/dashboard/surveillance"),
          },
        });
      } catch {
        // ignore
      }
    };

    const onError = async () => {
      // Si l'utilisateur n'est pas authentifié, on coupe pour éviter de spammer.
      const ok = await isAuthenticated().catch(() => false);
      if (!ok) {
        eventSource.close();
      }
    };

    eventSource.addEventListener("alarm", onAlarm);
    eventSource.addEventListener("error", onError);

    return () => {
      eventSource.removeEventListener("alarm", onAlarm);
      eventSource.removeEventListener("error", onError);
      eventSource.close();
    };
  }, [alarmStreamUrl, router]);

  useEffect(() => {
    const run = async () => {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

      const ok = await isAuthenticated().catch(() => false);
      if (!ok) return;

      if (Notification.permission === "granted") {
        await ensurePushSubscription().catch(() => null);
        return;
      }

      if (Notification.permission !== "default") return;

      const key = "vigitemp_push_prompted_v1";
      if (localStorage.getItem(key) === "1") return;
      localStorage.setItem(key, "1");

      toast("Activer les notifications Windows ?", {
        description: "Pour recevoir les alarmes même si le site est fermé.",
        action: {
          label: "Activer",
          onClick: async () => {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              toast.error("Notifications refusées");
              return;
            }
            await ensurePushSubscription();
            toast.success("Notifications activées");
          },
        },
      });
    };

    void run();
  }, []);

  return null;
}
