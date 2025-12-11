"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

const firstLoginSchema = z.object({
  newPassword: z.string().min(1, "Nouveau mot de passe requis"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FirstLoginFormData = z.infer<typeof firstLoginSchema>;

export default function FirstLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const userId = searchParams.get("userId");

  // Récupérer les règles de mot de passe depuis l'API
  const { data: passwordRules } = useQuery({
    queryKey: ["password-rules"],
    queryFn: async () => {
      const res = await fetch("/api/settings/password-rules");
      if (!res.ok) throw new Error("Failed to fetch password rules");
      return res.json();
    },
  });

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FirstLoginFormData>({
    resolver: zodResolver(firstLoginSchema),
  });

  const newPassword = watch("newPassword");

  // Valider le mot de passe en temps réel
  useEffect(() => {
    if (!newPassword || !passwordRules) return;

    setPasswordValidation({
      minLength: newPassword.length >= (passwordRules.minLength || 12),
      hasUpperCase: passwordRules.requireUpperCase ? /[A-Z]/.test(newPassword) : true,
      hasLowerCase: passwordRules.requireLowerCase ? /[a-z]/.test(newPassword) : true,
      hasNumber: passwordRules.requireNumbers ? /\d/.test(newPassword) : true,
      hasSpecialChar: passwordRules.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) : true,
    });
  }, [newPassword, passwordRules]);

  const isPasswordValid = passwordRules && Object.values(passwordValidation).every(Boolean);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: FirstLoginFormData) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Échec du changement de mot de passe");
      }

      return response.json();
    },
    onSuccess: () => {
      router.push("/login?passwordChanged=true");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const onSubmit = (data: FirstLoginFormData) => {
    if (!isPasswordValid) {
      setError("Le mot de passe ne respecte pas les critères requis");
      return;
    }
    setError(null);
    changePasswordMutation.mutate(data);
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Première connexion</CardTitle>
          <CardDescription>
            Veuillez changer votre mot de passe temporaire pour continuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Veuillez créer un nouveau mot de passe sécurisé pour votre compte.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                disabled={changePasswordMutation.isPending}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            {newPassword && passwordRules && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Critères du mot de passe :</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    {passwordValidation.minLength ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}>
                      Au moins {passwordRules.minLength} caractères
                    </span>
                  </li>
                  {passwordRules.requireUpperCase && (
                    <li className="flex items-center gap-2">
                      {passwordValidation.hasUpperCase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={passwordValidation.hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                        Une majuscule
                      </span>
                    </li>
                  )}
                  {passwordRules.requireLowerCase && (
                    <li className="flex items-center gap-2">
                      {passwordValidation.hasLowerCase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={passwordValidation.hasLowerCase ? "text-green-600" : "text-muted-foreground"}>
                        Une minuscule
                      </span>
                    </li>
                  )}
                  {passwordRules.requireNumbers && (
                    <li className="flex items-center gap-2">
                      {passwordValidation.hasNumber ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                        Un chiffre
                      </span>
                    </li>
                  )}
                  {passwordRules.requireSpecialChars && (
                    <li className="flex items-center gap-2">
                      {passwordValidation.hasSpecialChar ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-muted-foreground"}>
                        Un caractère spécial
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={changePasswordMutation.isPending}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={changePasswordMutation.isPending || !isPasswordValid}
            >
              {changePasswordMutation.isPending ? "Changement en cours..." : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
