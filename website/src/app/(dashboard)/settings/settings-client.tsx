"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SwitchWithLoading } from "@/components/ui/switch-with-loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordRulesSettings } from "@/components/password-rules-settings";
import { settingsApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface Props {
  settings: Setting[];
}

export function SettingsClient({ settings: initialSettings }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // État local pour les settings (mise à jour optimiste)
  const [settings, setSettings] = useState(initialSettings);
  
  // Synchroniser avec les props si elles changent (après router.refresh)
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);
  
  // État pour le verrouillage automatique
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockDuration, setAutoLockDuration] = useState(15);

  // Charger la config au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("autoLockConfig");
      if (stored) {
        const config = JSON.parse(stored);
        setAutoLockEnabled(config.enabled);
        setAutoLockDuration(config.duration);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la config:", error);
    }
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingsApi.update(key, value),
  });

  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const handleToggle = (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    
    // Mise à jour optimiste de l'état local
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key 
          ? { ...setting, value: newValue }
          : setting
      )
    );
    
    // Ajouter la clé aux loading
    setLoadingKeys(prev => new Set(prev).add(key));
    
    updateMutation.mutate(
      { key, value: newValue },
      {
        onSuccess: () => {
          // Attendre un peu avant de refresh pour que le cache soit invalidé
          setTimeout(() => {
            router.refresh();
          }, 100);
          toast.success("Paramètre mis à jour");
        },
        onError: () => {
          // Rollback en cas d'erreur
          setSettings(prev => 
            prev.map(setting => 
              setting.key === key 
                ? { ...setting, value: currentValue }
                : setting
            )
          );
          toast.error("Erreur lors de la mise à jour");
        },
        onSettled: () => {
          // Retirer la clé des loading après la requête
          setLoadingKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        },
      }
    );
  };

  const handleRefreshIntervalChange = (key: string, newValue: string) => {
    // Mise à jour optimiste de l'état local
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key 
          ? { ...setting, value: newValue }
          : setting
      )
    );
    
    // Ajouter la clé aux loading
    setLoadingKeys(prev => new Set(prev).add(key));
    
    updateMutation.mutate(
      { key, value: newValue },
      {
        onSuccess: () => {
          // Attendre un peu avant de refresh pour que le cache soit invalidé
          setTimeout(() => {
            router.refresh();
          }, 100);
          
          // Message de succès adapté
          const intervalLabel = 
            newValue === "0" ? "Manuel (désactivé)" :
            newValue === "5" ? "5 secondes" :
            newValue === "10" ? "10 secondes" :
            newValue === "30" ? "30 secondes" :
            newValue === "60" ? "1 minute" : `${newValue} secondes`;
          
          toast.success(`Intervalle de rafraîchissement: ${intervalLabel}`);
          
          // Déclencher un événement storage pour synchroniser avec le hook
          window.dispatchEvent(new Event("storage"));
        },
        onError: () => {
          // Rollback en cas d'erreur
          const currentSetting = settings.find(s => s.key === key);
          const currentValue = currentSetting?.value || "30";
          
          setSettings(prev => 
            prev.map(setting => 
              setting.key === key 
                ? { ...setting, value: currentValue }
                : setting
            )
          );
          toast.error("Erreur lors de la mise à jour");
        },
        onSettled: () => {
          // Retirer la clé des loading après la requête
          setLoadingKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        },
      }
    );
  };

  // Gestion du verrouillage automatique
  const handleAutoLockToggle = (enabled: boolean) => {
    setAutoLockEnabled(enabled);
    const config = { enabled, duration: autoLockDuration };
    localStorage.setItem("autoLockConfig", JSON.stringify(config));
    toast.success(
      enabled
        ? `Verrouillage automatique activé (${autoLockDuration} min)`
        : "Verrouillage automatique désactivé"
    );
    // Déclencher un événement storage pour synchroniser avec le hook
    window.dispatchEvent(new Event("storage"));
  };

  const handleAutoLockDurationChange = (duration: string) => {
    const durationNum = parseInt(duration, 10);
    setAutoLockDuration(durationNum);
    const config = { enabled: autoLockEnabled, duration: durationNum };
    localStorage.setItem("autoLockConfig", JSON.stringify(config));
    toast.success(`Durée d'inactivité définie à ${durationNum} minutes`);
    // Déclencher un événement storage pour synchroniser avec le hook
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
          <CardDescription>
            Paramètres généraux de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <Label htmlFor={setting.key} className="flex-1">
                {setting.label}
              </Label>
              
              {setting.key === "dashboard:refresh" ? (
                <Select
                  value={setting.value}
                  onValueChange={(value) => handleRefreshIntervalChange(setting.key, value)}
                  disabled={loadingKeys.has(setting.key)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 secondes</SelectItem>
                    <SelectItem value="10">10 secondes</SelectItem>
                    <SelectItem value="30">30 secondes</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="0">Manuel (désactivé)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <SwitchWithLoading
                  id={setting.key}
                  checked={setting.value === "true"}
                  onCheckedChange={() => handleToggle(setting.key, setting.value)}
                  isLoading={loadingKeys.has(setting.key)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Paramètres de sécurité et de session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="autoLock" className="font-medium">
                Verrouillage automatique
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Déconnexion automatique après une période d&apos;inactivité
              </p>
            </div>
            <SwitchWithLoading
              id="autoLock"
              checked={autoLockEnabled}
              onCheckedChange={handleAutoLockToggle}
            />
          </div>

          {autoLockEnabled && (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="autoLockDuration" className="font-medium">
                  Durée d&apos;inactivité
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Temps avant déconnexion automatique
                </p>
              </div>
              <Select
                value={autoLockDuration.toString()}
                onValueChange={handleAutoLockDurationChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Règles de mot de passe</CardTitle>
          <CardDescription>
            Configurer les exigences de sécurité pour les mots de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordRulesSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Gérer les préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configuration avancée des notifications à venir
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
