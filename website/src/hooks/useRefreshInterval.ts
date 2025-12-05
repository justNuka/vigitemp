"use client";

import { useState, useEffect } from "react";

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 secondes par défaut

/**
 * Hook pour obtenir l'intervalle de rafraîchissement depuis les paramètres utilisateur
 * Permet de contrôler la fréquence de mise à jour des données en temps réel
 */
export function useRefreshInterval() {
  const [refreshInterval, setRefreshInterval] = useState<number | false>(DEFAULT_REFRESH_INTERVAL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRefreshInterval() {
      try {
        const response = await fetch("/api/settings/dashboard:refresh");
        
        if (response.ok) {
          const data = await response.json();
          const seconds = parseInt(data.value, 10);
          
          // Si la valeur est 0 ou invalide, désactiver le refresh automatique
          if (isNaN(seconds) || seconds <= 0) {
            setRefreshInterval(false);
          } else {
            // Convertir les secondes en millisecondes
            setRefreshInterval(seconds * 1000);
          }
        } else {
          // En cas d'erreur, utiliser la valeur par défaut
          setRefreshInterval(DEFAULT_REFRESH_INTERVAL);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'intervalle:", error);
        setRefreshInterval(DEFAULT_REFRESH_INTERVAL);
      } finally {
        setIsLoading(false);
      }
    }

    loadRefreshInterval();

    // Écouter les changements de settings (depuis d'autres onglets ou après modification)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "settings-updated") {
        loadRefreshInterval();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { refreshInterval, isLoading };
}
