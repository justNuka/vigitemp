"use client"

import { useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { CheckCircle2, XCircle } from "lucide-react"
import { usePasswordRules } from "@/hooks/usePasswordRules"
import { PasswordField } from "@/components/password/password-field"
import { PasswordRulesList } from "@/components/password/password-rules-list"
import {
  areAllPasswordRuleChecksValid,
  getEffectivePasswordRules,
  getPasswordRuleChecks,
} from "@/components/password/password-rules"
import { postJson } from "@/lib/http"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const { data: passwordRules } = usePasswordRules()

  const effectiveRules = useMemo(() => getEffectivePasswordRules(passwordRules), [passwordRules])

  const ruleChecks = useMemo(
    () =>
      getPasswordRuleChecks({
        password: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        rules: effectiveRules,
        includeConfirmMatch: true,
      }),
    [effectiveRules, formData.confirmPassword, formData.newPassword],
  )

  const allRulesValid = useMemo(() => areAllPasswordRuleChecksValid(ruleChecks), [ruleChecks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien complet reçu par email.")
      return
    }

    if (!allRulesValid) {
      setError("Veuillez respecter toutes les règles de mot de passe.")
      return
    }

    setIsLoading(true)

    try {
      await postJson<{ message: string }>("/api/auth/reset-password", {
        token,
        newPassword: formData.newPassword,
      })

      setSuccess(true)

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-center">Lien invalide</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Le lien de réinitialisation est invalide ou incomplet. Veuillez utiliser le lien complet reçu par email.
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-center">Mot de passe réinitialisé !</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Se connecter maintenant
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
          <CardDescription className="text-center">Choisissez un nouveau mot de passe sécurisé</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <PasswordField
              id="newPassword"
              label="Nouveau mot de passe"
              required
              disabled={isLoading}
              inputProps={{
                value: formData.newPassword,
                onChange: (e) => setFormData({ ...formData, newPassword: e.target.value }),
                placeholder: "Entrez votre nouveau mot de passe",
                autoComplete: "new-password",
              }}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirmer le mot de passe"
              required
              disabled={isLoading}
              inputProps={{
                value: formData.confirmPassword,
                onChange: (e) => setFormData({ ...formData, confirmPassword: e.target.value }),
                placeholder: "Confirmez votre nouveau mot de passe",
                autoComplete: "new-password",
              }}
            />

            <PasswordRulesList
              password={formData.newPassword}
              confirmPassword={formData.confirmPassword}
              rules={effectiveRules}
              includeConfirmMatch
            />

            <Button type="submit" className="w-full" disabled={isLoading || !allRulesValid}>
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
