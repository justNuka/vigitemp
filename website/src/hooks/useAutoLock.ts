"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AutoLockConfig {
  enabled: boolean;
  duration: number; // en minutes
}

const DEFAULT_DURATION = 15; // 15 minutes par défaut

export function useAutoLock() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<AutoLockConfig | null>(null);

  // Charger la config depuis localStorage
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
    try {
      await fetch("/api/auth/logout-auto", { method: "POST" });
      router.push("/login?reason=inactivity");
    } catch (error) {
      console.error("Erreur lors du logout automatique:", error);
      router.push("/login");
    }
  }, [router]);

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

  // Événements à écouter
  useEffect(() => {
    // Charger la config au montage
    const config = loadConfig();
    configRef.current = config;

    // Ne pas activer si désactivé
    if (!config.enabled) {
      return;
    }

    // Événements qui indiquent une activité
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Démarrer le timer initial
    resetTimer();

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

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadConfig, resetTimer]);

  // Fonction pour mettre à jour la config (utilisée dans les settings)
  const updateConfig = useCallback((newConfig: Partial<AutoLockConfig>) => {
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    try {
      localStorage.setItem("autoLockConfig", JSON.stringify(updatedConfig));
      configRef.current = updatedConfig;
      resetTimer();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la config auto-lock:", error);
    }
  }, [loadConfig, resetTimer]);

  return { updateConfig };
}
