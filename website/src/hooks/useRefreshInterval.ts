"use client";

import { useState } from "react";

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 secondes par défaut

/**
 * Hook pour obtenir l'intervalle de rafraîchissement depuis les paramètres utilisateur
 * Permet de contrôler la fréquence de mise à jour des données en temps réel
 * 
 * Actuellement simplifié pour éviter les appels API qui causent des erreurs
 */
export function useRefreshInterval() {
  // Pour l'instant, juste retourner la valeur par défaut
  // Pas d'appel API pour éviter les cascades d'erreurs
  const [refreshInterval] = useState<number | false>(DEFAULT_REFRESH_INTERVAL);

  return { refreshInterval, isLoading: false };
}
