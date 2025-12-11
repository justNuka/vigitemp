"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { alarmsApi, settingsApi } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getAll(),
  });

  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingsApi.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Paramètre mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const activeAlarms = alarms?.filter((a) => a.status === "active") || [];

  const handleToggle = (key: string, currentValue: string) => {
    const newValue = currentValue === "true" ? "false" : "true";
    updateMutation.mutate({ key, value: newValue });
  };

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Paramétrage"
        description="Configuration de l'application"
        activeAlarms={activeAlarms.length}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Général</CardTitle>
            <CardDescription>
              Paramètres généraux de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mute-alarms">Sourdine alarmes</Label>
                <p className="text-sm text-muted-foreground">
                  Couper temporairement les notifications sonores
                </p>
              </div>
              <Switch
                id="mute-alarms"
                checked={settings?.find((s) => s.key === "mute_alarms")?.value === "true"}
                onCheckedChange={() =>
                  handleToggle(
                    "mute_alarms",
                    settings?.find((s) => s.key === "mute_alarms")?.value || "false"
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refresh">Actualisation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Rafraîchir automatiquement les données toutes les 30 secondes
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={settings?.find((s) => s.key === "auto_refresh")?.value === "true"}
                onCheckedChange={() =>
                  handleToggle(
                    "auto_refresh",
                    settings?.find((s) => s.key === "auto_refresh")?.value || "true"
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notifications email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les alertes par email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings?.find((s) => s.key === "email_notifications")?.value === "true"}
                onCheckedChange={() =>
                  handleToggle(
                    "email_notifications",
                    settings?.find((s) => s.key === "email_notifications")?.value || "false"
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Version</CardTitle>
            <CardDescription>
              Informations sur la version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">Vigitemp Light 1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Licence</span>
                <span className="font-medium">Light Edition</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
