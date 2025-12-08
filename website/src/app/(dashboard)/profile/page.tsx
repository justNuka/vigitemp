"use client";

import { useState } from "react";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { validatePassword, calculatePasswordStrength } from "@/lib/password-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schéma de validation Zod
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: rules, isLoading: rulesLoading } = usePasswordRules();
  const { toast } = useToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Validation en temps réel
  const newPassword = form.watch("newPassword");
  const validation = rules ? validatePassword(newPassword, rules) : null;
  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === form.watch("confirmPassword") && form.watch("confirmPassword").length > 0;

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 25) return "Faible";
    if (strength < 50) return "Moyen";
    if (strength < 75) return "Bon";
    return "Fort";
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError(null);

    if (!validation?.isValid) {
      setError("Veuillez respecter toutes les règles de mot de passe");
      return;
    }

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Erreur lors du changement de mot de passe");
      }

      // Succès !
      toast({
        title: "Mot de passe changé",
        description: "Votre mot de passe a été changé avec succès",
      });

      // Réinitialiser le formulaire
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  if (rulesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et vos paramètres de sécurité"
        activeAlarms={0}
      />
      
      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Modifiez votre mot de passe en respectant les règles de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Ancien mot de passe */}
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancien mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Entrez votre ancien mot de passe"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            disabled={form.formState.isSubmitting}
                          >
                            {showOldPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nouveau mot de passe */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Entrez votre nouveau mot de passe"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={form.formState.isSubmitting}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      
                      {/* Indicateur de force */}
                      {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Force du mot de passe :</span>
                    <span className={`font-medium ${passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2">
                    <div
                      className={`h-full transition-all ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </Progress>
                </div>
              )}

              {/* Règles de validation */}
              {newPassword && rules && (
                <div className="space-y-1 rounded-md border p-3 text-sm">
                  <p className="font-medium mb-2">Règles à respecter :</p>
                  {[
                    { met: newPassword.length >= rules.min_length, text: `Au moins ${rules.min_length} caractères` },
                    { met: (newPassword.match(/[A-Z]/g) || []).length >= rules.min_uppercase, text: `Au moins ${rules.min_uppercase} majuscule(s)` },
                    { met: (newPassword.match(/[a-z]/g) || []).length >= rules.min_lowercase, text: `Au moins ${rules.min_lowercase} minuscule(s)` },
                    { met: (newPassword.match(/[0-9]/g) || []).length >= rules.min_numbers, text: `Au moins ${rules.min_numbers} chiffre(s)` },
                    { met: (newPassword.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= rules.min_special, text: `Au moins ${rules.min_special} caractère(s) spécial(aux)` },
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {rule.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={rule.met ? "text-green-600" : "text-muted-foreground"}>
                        {rule.text}
                      </span>
                    </div>
                  ))}
                </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Confirmer mot de passe */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmez votre nouveau mot de passe"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={form.formState.isSubmitting}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {form.watch("confirmPassword") && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          {passwordsMatch ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Les mots de passe correspondent</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Les mots de passe ne correspondent pas</span>
                            </>
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Erreur */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Bouton submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting || !validation?.isValid || !passwordsMatch}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changement en cours...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
