"use client";

import { useEffect, useState } from "react";

/**
 * Hook pour afficher l'heure courante qui se met à jour automatiquement
 * Compatible avec Next.js 16 Cache Components
 */
export function useCurrentTime(updateInterval = 1000) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialiser l'heure côté client uniquement
    setTime(new Date());

    // Mettre à jour toutes les secondes
    const interval = setInterval(() => {
      setTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return time;
}
