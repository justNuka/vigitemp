"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const firstLoginSchema = z.object({
  newPassword: z.string().min(1, "Nouveau mot de passe requis"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FirstLoginFormData = z.infer<typeof firstLoginSchema>;

interface FirstLoginFormProps {
  userId: string;
  onSuccess: () => void;
}

export function FirstLoginForm({ userId, onSuccess }: FirstLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Récupérer les règles de mot de passe depuis l'API
  const { data: passwordRules } = useQuery({
    queryKey: ["password-rules"],
    queryFn: async () => {
      const res = await fetch("/api/settings/password-rules");
      if (!res.ok) throw new Error("Failed to fetch password rules");
      return res.json();
    },
  });

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
      minLength: newPassword.length >= (passwordRules.min_length || 8),
      hasUpperCase: passwordRules.min_uppercase ? /[A-Z]/.test(newPassword) : true,
      hasLowerCase: passwordRules.min_lowercase ? /[a-z]/.test(newPassword) : true,
      hasNumber: passwordRules.min_numbers ? /\d/.test(newPassword) : true,
      hasSpecialChar: passwordRules.min_special ? /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) : true,
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
      onSuccess();
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

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Première connexion</h3>
        <p className="text-sm text-muted-foreground">
          Veuillez créer un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez changer votre mot de passe temporaire avant de continuer.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="firstLoginNewPassword">Nouveau mot de passe</Label>
          <Input
            id="firstLoginNewPassword"
            type="password"
            {...register("newPassword")}
            disabled={changePasswordMutation.isPending}
            placeholder="Entrez un nouveau mot de passe"
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
                  Au moins {passwordRules.min_length} caractères
                </span>
              </li>
              {passwordRules.min_uppercase ? (
                <li className="flex items-center gap-2">
                  {passwordValidation.hasUpperCase ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordValidation.hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                    {passwordRules.min_uppercase} majuscule{passwordRules.min_uppercase > 1 ? 's' : ''}
                  </span>
                </li>
              ) : null}
              {passwordRules.min_lowercase ? (
                <li className="flex items-center gap-2">
                  {passwordValidation.hasLowerCase ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordValidation.hasLowerCase ? "text-green-600" : "text-muted-foreground"}>
                    {passwordRules.min_lowercase} minuscule{passwordRules.min_lowercase > 1 ? 's' : ''}
                  </span>
                </li>
              ) : null}
              {passwordRules.min_numbers ? (
                <li className="flex items-center gap-2">
                  {passwordValidation.hasNumber ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                    {passwordRules.min_numbers} chiffre{passwordRules.min_numbers > 1 ? 's' : ''}
                  </span>
                </li>
              ) : null}
              {passwordRules.min_special ? (
                <li className="flex items-center gap-2">
                  {passwordValidation.hasSpecialChar ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-muted-foreground"}>
                    {passwordRules.min_special} caractère spécial{passwordRules.min_special > 1 ? 's' : ''}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="firstLoginConfirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="firstLoginConfirmPassword"
            type="password"
            {...register("confirmPassword")}
            disabled={changePasswordMutation.isPending}
            placeholder="Confirmez votre mot de passe"
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
    </div>
  );
}
