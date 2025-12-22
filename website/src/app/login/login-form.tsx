"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FirstLoginForm } from "@/components/auth/first-login-form";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [firstLoginUserId, setFirstLoginUserId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Vérifier si déconnecté pour inactivité ou changement de mot de passe
  useEffect(() => {
    const reason = searchParams.get("reason");
    const passwordChanged = searchParams.get("passwordChanged");
    
    if (reason === "inactivity") {
      setShowInactivityMessage(true);
      toast.warning("Session expirée", {
        description: "Vous avez été déconnecté pour cause d'inactivité",
      });
    }
    
    if (passwordChanged === "true") {
      toast.success("Mot de passe changé", {
        description: "Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter.",
      });
    }
  }, [searchParams]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.requirePasswordChange) {
          // Vérifier le type d'erreur pour afficher le formulaire ou rediriger
          if (error.error === "temporary_password") {
            setFirstLoginUserId(error.userId);
            setShowFirstLogin(true);
            throw new Error("temporary_password");
          }
          // Rediriger vers la page de changement forcé pour expiration
          // Stocker le username en session/cookie sécurisé
          try {
            const tokenRes = await fetch('/api/auth/temp-password-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username }),
            });
            if (tokenRes.ok) {
              router.push('/force-password-change');
            } else {
              toast.error('Erreur lors de la redirection');
            }
          } catch (err) {
            toast.error('Erreur de sécurité');
          }
          throw new Error("password_change_required");
        }
        throw new Error("Login failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success("Connexion réussie");
      router.push("/");
    },
    onError: (error: Error) => {
      if (error.message === "temporary_password") {
        toast.info("Première connexion", {
          description: "Veuillez changer votre mot de passe temporaire",
        });
      } else if (error.message !== "password_change_required") {
        toast.error("Identifiants incorrects");
      }
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

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la demande");
      }

      return res.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast.success("Email envoyé", {
        description: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }
    resetPasswordMutation.mutate();
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSuccess(false);
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
            Licence Light
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
              {showFirstLogin ? "Première connexion" : "Entrez vos identifiants pour accéder au système"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showFirstLogin && firstLoginUserId ? (
              <FirstLoginForm 
                userId={firstLoginUserId}
                onSuccess={() => {
                  toast.success("Mot de passe changé", {
                    description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
                  });
                  setShowFirstLogin(false);
                  setFirstLoginUserId(null);
                  setUsername("");
                  setPassword("");
                }}
              />
            ) : (
              <>
                {showInactivityMessage && (
                  <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-600">
                      Vous avez été déconnecté automatiquement après une période d&apos;inactivité.
                      Reconnectez-vous pour continuer.
                    </AlertDescription>
                  </Alert>
                )}
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

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:underline"
                      disabled={loginMutation.isPending}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Surveillance environnementale pour laboratoires
        </p>
      </div>

      <p className="w-full text-center text-xs text-muted-foreground/70 pb-4">
        Vigitemp Light - MC2 Technologies
      </p>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe oublié ?</DialogTitle>
            <DialogDescription>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </DialogDescription>
          </DialogHeader>

          {resetSuccess ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
              <Button onClick={handleCloseForgotPassword} className="w-full">
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Adresse email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoFocus
                  disabled={resetPasswordMutation.isPending}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForgotPassword}
                  disabled={resetPasswordMutation.isPending}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="flex-1"
                >
                  {resetPasswordMutation.isPending ? "Envoi..." : "Envoyer"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
