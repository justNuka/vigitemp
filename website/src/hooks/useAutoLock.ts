"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { buildLocalizedPath, resolveLocaleFromPathname } from "@/i18n/pathnames";
import { fetchJson } from "@/lib/http";
import { markDisconnectReason } from "@/lib/auth-disconnect-marker";

interface AutoLockConfig {
  enabled: boolean;
  duration: number; // en minutes
}

const DEFAULT_DURATION = 15; // 15 minutes par défaut
const AUTO_LOCK_CONFIG_EVENT = "vigitemp:auto-lock-config-changed";
const SHARED_ACTIVITY_STORAGE_KEY = "vigisensys:last-user-activity";
const SHARED_ACTIVITY_WRITE_INTERVAL_MS = 5_000;
const SESSION_TOUCH_INTERVAL_MS = 4 * 60 * 1000;

export function useAutoLock() {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, "") || "/";
  const isMetrologyOperationPage =
    normalizedPathname === "/admin/metrologie/realiser-ajustage" ||
    normalizedPathname.startsWith("/admin/metrologie/realiser-ajustage/") ||
    normalizedPathname === "/admin/metrologie/realiser-etalonnage" ||
    normalizedPathname.startsWith("/admin/metrologie/realiser-etalonnage/");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<AutoLockConfig | null>(null);
  const lastSessionTouchAtRef = useRef(0);
  const sessionTouchInFlightRef = useRef(false);
  const lastSharedActivityWriteAtRef = useRef(0);

  // Charger la config depuis le cache local. La base reste la source de vérité,
  // mais ce cache évite de retomber à 15 min pendant le chargement initial.
  const loadConfig = useCallback((): AutoLockConfig => {
    if (typeof window === "undefined") {
      return { enabled: true, duration: DEFAULT_DURATION };
    }

    try {
      const stored = localStorage.getItem("autoLockConfig");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la config auto-lock:", error);
    }

    return { enabled: true, duration: DEFAULT_DURATION };
  }, []);

  const recordSharedActivity = useCallback((force = false) => {
    if (typeof window === "undefined") return;

    const now = Date.now();
    if (
      !force &&
      now - lastSharedActivityWriteAtRef.current < SHARED_ACTIVITY_WRITE_INTERVAL_MS
    ) {
      return;
    }

    lastSharedActivityWriteAtRef.current = now;
    try {
      localStorage.setItem(SHARED_ACTIVITY_STORAGE_KEY, String(now));
    } catch {
      // L'auto-lock doit continuer de fonctionner même si le stockage local est indisponible.
    }
  }, []);

  const touchSession = useCallback(async (force = false) => {
    if (typeof window === "undefined" || sessionTouchInFlightRef.current) return;

    const now = Date.now();
    if (!force && now - lastSessionTouchAtRef.current < SESSION_TOUCH_INTERVAL_MS) return;

    lastSessionTouchAtRef.current = now;
    sessionTouchInFlightRef.current = true;

    try {
      await fetchJson<{ success: true; engine: "legacy" | "better-auth"; expiresAt?: string }>(
        "/api/auth/session-touch",
        {
          method: "POST",
          credentials: "include",
        },
      );
    } catch (error) {
      // Le helper HTTP central traite déjà un 401 en redirigeant vers la connexion.
      // Les autres erreurs ne doivent pas interrompre l'activité utilisateur.
      console.error("Erreur lors du rafraîchissement de la session:", error);
    } finally {
      sessionTouchInFlightRef.current = false;
    }
  }, []);

  // Fonction de logout automatique
  const handleLogout = useCallback(async () => {
    const locale = typeof window !== "undefined" ? resolveLocaleFromPathname(window.location.pathname) : "fr";
    const from =
      typeof window !== "undefined"
        ? `${window.location.pathname.replace(/^\/([a-z]{2})(?=\/|$)/i, "") || "/"}${window.location.search || ""}`
        : "/";
    const localizedLoginPath = buildLocalizedPath("/login", locale, { reason: "inactivity", from });

    try {
      await fetchJson<{ success: true }>("/api/auth/logout-auto", { method: "POST", credentials: "include" });
      markDisconnectReason("inactivity");
      window.location.assign(localizedLoginPath);
    } catch (error) {
      console.error("Erreur lors du logout automatique:", error);
      window.location.assign(localizedLoginPath);
    }
  }, []);

  // Réinitialiser le timer d'inactivité
  const resetTimer = useCallback(() => {
    const config = configRef.current || loadConfig();
    configRef.current = config;

    // Ces deux opérations doivent rester ouvertes même après une longue période
    // sans activité afin qu'une action opérateur ne déclenche jamais l'auto-logout.
    if (isMetrologyOperationPage) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Ne pas activer si désactivé
    if (!config.enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Effacer l'ancien timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timer
    const timeoutDuration = config.duration * 60 * 1000; // Convertir minutes en ms
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutDuration);
  }, [loadConfig, handleLogout, isMetrologyOperationPage]);

  const handleUserActivity = useCallback(() => {
    recordSharedActivity();
    resetTimer();
    void touchSession();
  }, [recordSharedActivity, resetTimer, touchSession]);

  const refreshConfigFromApi = useCallback(async () => {
    try {
      const config = await fetchJson<AutoLockConfig>("/api/parametres/auto-lock", {
        credentials: "include",
      });
      configRef.current = config;
      try {
        localStorage.setItem("autoLockConfig", JSON.stringify(config));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la config auto-lock:", error);
      }
      resetTimer();
    } catch (error) {
      console.error("Erreur lors du chargement de la config auto-lock:", error);
    }
  }, [resetTimer]);

  // Événements à écouter
  useEffect(() => {
    // Charger la config au montage
    const config = loadConfig();
    configRef.current = config;

    // Événements qui indiquent une activité
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    // Ouvrir/rafraîchir une page authentifiée constitue une activité de la session.
    recordSharedActivity(true);
    resetTimer();
    void refreshConfigFromApi();

    // Ajouter les listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Synchroniser configuration et activité entre tous les onglets du même navigateur.
    // Sans cela, un onglet oublié pourrait révoquer la session partagée pendant que
    // l'utilisateur travaille activement dans un autre onglet.
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "autoLockConfig") {
        const newConfig = loadConfig();
        configRef.current = newConfig;
        resetTimer();
        return;
      }

      if (e.key === SHARED_ACTIVITY_STORAGE_KEY && e.newValue) {
        resetTimer();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const handleConfigChange = (event: Event) => {
      const customEvent = event as CustomEvent<AutoLockConfig>;
      if (customEvent.detail) {
        configRef.current = customEvent.detail;
        resetTimer();
        return;
      }
      void refreshConfigFromApi();
    };
    window.addEventListener(AUTO_LOCK_CONFIG_EVENT, handleConfigChange);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTO_LOCK_CONFIG_EVENT, handleConfigChange);
    };
  }, [
    handleUserActivity,
    loadConfig,
    recordSharedActivity,
    refreshConfigFromApi,
    resetTimer,
  ]);

  // Les opérations de métrologie neutralisent volontairement l'auto-lock. Il faut donc
  // maintenir la session serveur vivante même si l'opérateur ne touche pas l'interface.
  useEffect(() => {
    if (!isMetrologyOperationPage) return;

    void touchSession(true);
    const interval = window.setInterval(() => {
      void touchSession(true);
    }, SESSION_TOUCH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isMetrologyOperationPage, touchSession]);

  // Fonction pour mettre à jour la config (utilisée dans les settings)
  const updateConfig = useCallback(
    (newConfig: Partial<AutoLockConfig>) => {
      const currentConfig = loadConfig();
      const updatedConfig = { ...currentConfig, ...newConfig };

      try {
        localStorage.setItem("autoLockConfig", JSON.stringify(updatedConfig));
        configRef.current = updatedConfig;
        window.dispatchEvent(
          new CustomEvent(AUTO_LOCK_CONFIG_EVENT, { detail: updatedConfig }),
        );
        resetTimer();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la config auto-lock:", error);
      }
    },
    [loadConfig, resetTimer],
  );

  return { updateConfig };
}
