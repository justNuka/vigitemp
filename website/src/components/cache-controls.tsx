"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function CacheControls() {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [lastRevalidated, setLastRevalidated] = useState<string | null>(null);
  const router = useRouter();

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const response = await fetch("/api/revalidate", {
        method: "GET",
      });
      const data = await response.json();
      
      if (data.success) {
        setLastRevalidated(new Date().toLocaleTimeString());
        // Force un refresh des données
        router.refresh();
      }
    } catch (error) {
      console.error("Error revalidating cache:", error);
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleHardRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      <Zap className="h-5 w-5 text-warning" />
      <div className="flex-1">
        <p className="text-sm font-medium">Contrôles Cache</p>
        <p className="text-xs text-muted-foreground">
          {lastRevalidated 
            ? `Dernière invalidation : ${lastRevalidated}`
            : "Cache actif - données ultra rapides"}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleHardRefresh}
          title="Rafraîchir les données depuis le cache"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleRevalidate}
          disabled={isRevalidating}
          title="Invalider le cache et recharger depuis la base"
        >
          {isRevalidating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Invalider Cache
        </Button>
      </div>
    </div>
  );
}
