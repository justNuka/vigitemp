"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(username, password),
    onSuccess: () => {
      toast.success("Connexion réussie");
      router.push("/");
    },
    onError: () => {
      toast.error("Identifiants incorrects");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo size="lg" showText />
          <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            Version Light
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
          <p className="text-sm text-muted-foreground">
            Accédez à votre système de surveillance environnementale
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder au système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre identifiant"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Surveillance environnementale pour laboratoires
        </p>
      </div>

      <p className="w-full text-center text-xs text-muted-foreground/70 pb-4">
        Vigitemp Light - MC2 Technologies
      </p>
    </div>
  );
}
