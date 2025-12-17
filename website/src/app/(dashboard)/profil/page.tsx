"use client";

import { useState, useEffect } from "react";
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
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, Mail, User, Shield, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/page-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CurrentUser } from "@/lib/types";
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
  const [userInfo, setUserInfo] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const { data: rules, isLoading: rulesLoading } = usePasswordRules();
  const { toast } = useToast();

  // Charger les infos utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des infos utilisateur:", err);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, []);

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

  // Calculer les jours restants avant changement de mdp requis
  const getDaysUntilPasswordExpiry = () => {
    if (!userInfo?.Date_Derniere_Modification_MDP || !userInfo?.cfr21?.enabled) {
      return null;
    }

    const lastChangeDate = new Date(userInfo.Date_Derniere_Modification_MDP);
    const expiryDate = new Date(lastChangeDate);
    expiryDate.setDate(expiryDate.getDate() + userInfo.cfr21.passwordMaxAgeDays);

    const today = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      expiryDate,
      isExpired: daysRemaining <= 0,
      isWarning: daysRemaining > 0 && daysRemaining <= 30,
    };
  };

  const passwordExpiry = getDaysUntilPasswordExpiry();

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

  if (rulesLoading || isLoadingUser) {
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
        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations du compte
            </CardTitle>
            <CardDescription>
              Vos données personnelles (en lecture seule)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Login</label>
                <Input
                  type="text"
                  value={userInfo?.Login || ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={userInfo?.Adresse_Email || ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <Input
                  type="text"
                  value={userInfo?.Nom || ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>

              {/* Prénom */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                <Input
                  type="text"
                  value={userInfo?.Prenom || ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>

              {/* Profil */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Profil</label>
                <Input
                  type="text"
                  value={userInfo?.profil || ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>

              {/* Date de création */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Compte créé le</label>
                <Input
                  type="text"
                  value={userInfo?.Date_Creation ? new Date(userInfo.Date_Creation).toLocaleDateString('fr-FR') : ""}
                  readOnly
                  className="cursor-not-allowed opacity-75"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Modifiez votre mot de passe en respectant les règles de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CFR21 Alert */}
            {userInfo?.cfr21?.enabled && (
              <div className="rounded-lg border-2 border-[#EABC00] bg-[#EABC00]/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#EABC00] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#EABC00] mb-1">Conformité CFR21 activée</h3>
                    <p className="text-sm text-muted-foreground">
                      Votre compte est soumis à la norme CFR21. Vous devez changer votre mot de passe régulièrement.
                    </p>
                    {userInfo.cfr21.nonReuseable && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Les anciens mots de passe ne peuvent pas être réutilisés.
                      </p>
                    )}
                  </div>
                </div>

                {/* Dernière modification et date d'expiration */}
                <div className="border-t border-[#EABC00]/20 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dernière modification du mot de passe :</span>
                    <span className="font-medium">
                      {userInfo?.Date_Derniere_Modification_MDP
                        ? new Date(userInfo.Date_Derniere_Modification_MDP).toLocaleDateString('fr-FR')
                        : "Jamais"}
                    </span>
                  </div>

                  {/* Password expiry info */}
                  {userInfo?.Date_Derniere_Modification_MDP && passwordExpiry && (
                    <div className={`flex items-center gap-3 p-2 rounded ${
                      passwordExpiry.isExpired
                        ? 'bg-red-500/10 border border-red-200'
                        : passwordExpiry.isWarning
                        ? 'bg-yellow-500/10 border border-yellow-200'
                        : 'bg-green-500/10 border border-green-200'
                    }`}>
                      <Clock className={`w-4 h-4 flex-shrink-0 ${
                        passwordExpiry.isExpired
                          ? 'text-red-600'
                          : passwordExpiry.isWarning
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        passwordExpiry.isExpired
                          ? 'text-red-700'
                          : passwordExpiry.isWarning
                          ? 'text-yellow-700'
                          : 'text-green-700'
                      }`}>
                        {passwordExpiry.isExpired ? (
                          <>🔴 Votre mot de passe a expiré - changement obligatoire</>
                        ) : passwordExpiry.isWarning ? (
                          <>⚠️ Vous devez changer votre mot de passe dans {passwordExpiry.daysRemaining} jour{passwordExpiry.daysRemaining > 1 ? 's' : ''}</>
                        ) : (
                          <>✓ Mot de passe valide pour {passwordExpiry.daysRemaining} jour{passwordExpiry.daysRemaining > 1 ? 's' : ''} ({new Date(passwordExpiry.expiryDate).toLocaleDateString('fr-FR')})</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulaire changement MDP */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
