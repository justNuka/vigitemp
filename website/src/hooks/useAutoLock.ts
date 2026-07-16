"use client";

import { useEffect, useRef, useCallback } from "react";
import { buildLocalizedPath, resolveLocaleFromPathname } from "@/i18n/pathnames";
import { fetchJson } from "@/lib/http";
import { markDisconnectReason } from "@/lib/auth-disconnect-marker";

interface AutoLockConfig {
  enabled: boolean;
  duration: number; // en minutes
}

const DEFAULT_DURATION = 15; // 15 minutes par défaut
const AUTO_LOCK_CONFIG_EVENT = "vigitemp:auto-lock-config-changed";

export function useAutoLock() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<AutoLockConfig | null>(null);

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
  }, [loadConfig, handleLogout]);

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
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

    // Démarrer le timer initial
    resetTimer();
    void refreshConfigFromApi();

    // Ajouter les listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Écouter les changements de config dans localStorage (pour synchroniser entre onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "autoLockConfig") {
        const newConfig = loadConfig();
        configRef.current = newConfig;
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
        document.removeEventListener(event, resetTimer, true);
      });
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTO_LOCK_CONFIG_EVENT, handleConfigChange);
    };
  }, [loadConfig, refreshConfigFromApi, resetTimer]);

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
