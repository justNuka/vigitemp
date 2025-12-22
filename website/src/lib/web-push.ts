import { prisma } from "@/lib/prisma";

type WebPushPayload = {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, unknown>;
};

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Configuration VAPID manquante (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)."
    );
  }

  return { publicKey, privateKey, subject };
}

let webPushConfigured = false;

async function getWebPush() {
  const mod: any = await import("web-push");
  const webpush = mod.default ?? mod;

  if (!webPushConfigured) {
    const { publicKey, privateKey, subject } = getVapidConfig();
    webpush.setVapidDetails(subject, publicKey, privateKey);
    webPushConfigured = true;
  }

  return webpush as {
    sendNotification: (
      subscription: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
        expirationTime?: number | null;
      },
      payload: string
    ) => Promise<void>;
  };
}

export async function sendWebPushToActiveSubscriptions(payload: WebPushPayload) {
  const activeSubscriptions = await prisma.t_push_subscription.findMany({
    where: { Est_Archive: false },
    select: {
      Id_Push_Subscription: true,
      Endpoint: true,
      Key_P256dh: true,
      Key_Auth: true,
      Expiration_Time: true,
    },
  });

  if (activeSubscriptions.length === 0) {
    return { sent: 0, failed: 0, archived: 0 };
  }

  const webpush = await getWebPush();
  const payloadString = JSON.stringify(payload);

  let sent = 0;
  let failed = 0;
  let archived = 0;

  await Promise.all(
    activeSubscriptions.map(async (sub) => {
      try {
        const expirationTime =
          sub.Expiration_Time === null || sub.Expiration_Time === undefined
            ? null
            : Number(sub.Expiration_Time);

        await webpush.sendNotification(
          {
            endpoint: sub.Endpoint,
            keys: { p256dh: sub.Key_P256dh, auth: sub.Key_Auth },
            expirationTime,
          },
          payloadString
        );
        sent += 1;
      } catch (err: any) {
        failed += 1;
        const statusCode = err?.statusCode ?? err?.status;
        if (statusCode === 404 || statusCode === 410) {
          archived += 1;
          await prisma.t_push_subscription.update({
            where: { Id_Push_Subscription: sub.Id_Push_Subscription },
            data: { Est_Archive: true, Date_Modification: new Date() },
          });
        }
      }
    })
  );

  return { sent, failed, archived };
}

