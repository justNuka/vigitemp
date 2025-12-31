"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getJson, putJson } from "@/lib/http";

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  sender: string;
}

interface SMTPConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SMTPConfigModal({ open, onOpenChange }: SMTPConfigModalProps) {
  const [config, setConfig] = useState<SMTPConfig>({
    host: "",
    port: 587,
    user: "",
    password: "",
    sender: "noreply@vigitemp.fr",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Charger la configuration au l'ouverture du modal
  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const payload = await getJson<SMTPConfig>("/api/admin/configuration-smtp");
      setConfig(payload);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (newConfig: SMTPConfig) => {
      return putJson<{ message: string }>("/api/admin/configuration-smtp", newConfig);
    },
    onSuccess: () => {
      toast.success("Configuration SMTP mise à jour avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur serveur");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    if (!config.host.trim()) {
      toast.error("Le serveur SMTP est requis");
      return;
    }
    if (!config.user.trim()) {
      toast.error("L'utilisateur SMTP est requis");
      return;
    }
    if (!config.password.trim()) {
      toast.error("Le mot de passe SMTP est requis");
      return;
    }
    if (config.port <= 0 || config.port > 65535) {
      toast.error("Le port doit être entre 1 et 65535");
      return;
    }

    updateMutation.mutate(config);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuration SMTP</DialogTitle>
          <DialogDescription>
            Configurez les paramètres du serveur de messagerie pour les notifications par email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="host">Serveur SMTP</Label>
            <Input
              id="host"
              type="text"
              placeholder="smtp.gmail.com"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              disabled={isLoading || updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Adresse du serveur de messagerie (ex: smtp.gmail.com, smtp.office365.com)
            </p>
          </div>

          <div>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              placeholder="587"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 587 })}
              disabled={isLoading || updateMutation.isPending}
              min="1"
              max="65535"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ports courants: 587 (TLS), 465 (SSL), 25 (SMTP non sécurisé)
            </p>
          </div>

          <div>
            <Label htmlFor="user">Utilisateur / Email</Label>
            <Input
              id="user"
              type="email"
              placeholder="votre-email@example.com"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              disabled={isLoading || updateMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              disabled={isLoading || updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Le mot de passe est chiffré et sécurisé
            </p>
          </div>

          <div>
            <Label htmlFor="sender">Adresse d'expédition</Label>
            <Input
              id="sender"
              type="email"
              placeholder="noreply@vigitemp.fr"
              value={config.sender}
              onChange={(e) => setConfig({ ...config, sender: e.target.value })}
              disabled={isLoading || updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Adresse apparaissant dans le champ "De" des emails
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
