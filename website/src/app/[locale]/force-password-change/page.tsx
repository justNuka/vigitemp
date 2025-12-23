"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { validatePassword } from "@/lib/password-validation";
import { toast } from "sonner";

export default function ForcePasswordChangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Récupérer le username depuis les cookies (accessible en client, lisible seulement)
  // Le token réel est en httpOnly et sera envoyé automatiquement avec les requêtes
  const [username, setUsername] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();

  // Valider le token au chargement de la page
  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch("/api/auth/validate-password-token", {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setTokenValid(true);
        } else {
          setError("Votre lien de changement de mot de passe a expiré. Veuillez vous reconnecter.");
          setTimeout(() => router.push("/login"), 3000);
        }
      } catch (err) {
        setError("Erreur de sécurité");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    checkToken();
  }, [router]);

  const validation = rules ? validatePassword(formData.newPassword, rules) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username) {
      setError("Nom d'utilisateur manquant");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (validation && !validation.isValid) {
      setError("Le mot de passe ne respecte pas les règles de sécurité");
      return;
    }

    setIsLoading(true);

    try {
      // Tenter de se connecter avec l'ancien mot de passe
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: formData.currentPassword,
        }),
      });

      if (!loginRes.ok) {
        const error = await loginRes.json();
        if (error.error !== "password_expired") {
          setError("Mot de passe actuel incorrect");
          setIsLoading(false);
          return;
        }
      }

      // Changer le mot de passe
      const changeRes = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (!changeRes.ok) {
        const error = await changeRes.json();
        setError(error.error || "Erreur lors du changement de mot de passe");
        setIsLoading(false);
        return;
      }

      // Reconnecter l'utilisateur avec le nouveau mot de passe
      const reloginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: formData.newPassword,
        }),
      });

      if (!reloginRes.ok) {
        setError("Mot de passe changé mais erreur de reconnexion");
        setIsLoading(false);
        return;
      }

      toast.success("Mot de passe changé avec succès");
      router.push("/");
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>Paramètres manquants</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Changement de mot de passe obligatoire</CardTitle>
          <CardDescription>
            Votre mot de passe a expiré. Vous devez le changer pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {rules && formData.newPassword && (
                <div className="mt-2 p-3 rounded-lg border bg-muted/50 space-y-2">
                  <p className="text-xs font-medium">Règles de sécurité :</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {formData.newPassword.length >= rules.min_length ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>Au moins {rules.min_length} caractères</span>
                    </div>
                    {rules.min_uppercase > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        {(formData.newPassword.match(/[A-Z]/g) || []).length >= rules.min_uppercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Au moins {rules.min_uppercase} majuscule(s)</span>
                      </div>
                    )}
                    {rules.min_lowercase > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        {(formData.newPassword.match(/[a-z]/g) || []).length >= rules.min_lowercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Au moins {rules.min_lowercase} minuscule(s)</span>
                      </div>
                    )}
                    {rules.min_numbers > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        {(formData.newPassword.match(/[0-9]/g) || []).length >= rules.min_numbers ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Au moins {rules.min_numbers} chiffre(s)</span>
                      </div>
                    )}
                    {rules.min_special > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        {(formData.newPassword.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= rules.min_special ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>Au moins {rules.min_special} caractère(s) spécial(aux)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || rulesLoading}>
              {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
