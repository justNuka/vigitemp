"use client"

import { useState } from "react"

const DEFAULT_REFRESH_INTERVAL = 60_000 // 60 secondes par défaut (moins de bruit serveur)

/**
 * Hook pour obtenir l'intervalle de rafraichissement depuis les paramètres utilisateur.
 *
 * Note: actuellement simplifié (pas d'appel API) pour éviter les cascades d'erreurs.
 */
export function useRefreshInterval() {
  const [refreshInterval] = useState<number | false>(DEFAULT_REFRESH_INTERVAL)
  return { refreshInterval, isLoading: false }
}

