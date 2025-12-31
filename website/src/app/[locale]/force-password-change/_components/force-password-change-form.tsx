"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

import { PasswordField } from "@/components/password/password-field"
import { PasswordRulesList } from "@/components/password/password-rules-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { postJson } from "@/lib/http"
import { validatePassword } from "@/lib/password-validation"
import type { PasswordRules } from "@/lib/api"

type Props = {
  username: string
  rules: PasswordRules | null | undefined
}

export function ForcePasswordChangeForm({ username, rules }: Props) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validation = rules ? validatePassword(formData.newPassword, rules) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (validation && !validation.isValid) {
      setError("Le mot de passe ne respecte pas les règles de sécurité")
      return
    }

    setIsLoading(true)

    try {
      await postJson<{ message: string; isFirstPasswordChange?: boolean }>("/api/auth/force-password-change", {
        username,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })

      toast.success("Mot de passe changé avec succès")
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PasswordField
        id="currentPassword"
        label="Mot de passe actuel"
        required
        disabled={isLoading}
        inputProps={{
          value: formData.currentPassword,
          onChange: (e) => setFormData({ ...formData, currentPassword: e.target.value }),
          autoComplete: "current-password",
        }}
      />

      <div className="space-y-2">
        <PasswordField
          id="newPassword"
          label="Nouveau mot de passe"
          required
          disabled={isLoading}
          inputProps={{
            value: formData.newPassword,
            onChange: (e) => setFormData({ ...formData, newPassword: e.target.value }),
            autoComplete: "new-password",
          }}
        />

        {rules && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3">
            <PasswordRulesList password={formData.newPassword} rules={rules} title="Règles de sécurité :" />
          </div>
        )}
      </div>

      <PasswordField
        id="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        required
        disabled={isLoading}
        inputProps={{
          value: formData.confirmPassword,
          onChange: (e) => setFormData({ ...formData, confirmPassword: e.target.value }),
          autoComplete: "new-password",
        }}
      />

      <Button type="submit" className="w-full" disabled={isLoading || !!(validation && !validation.isValid)}>
        {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
      </Button>
    </form>
  )
}

