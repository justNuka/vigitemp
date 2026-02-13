"use client"
import { showFormValidationToast } from "@/lib/form-toast"

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
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"

type Props = {
  username: string
  rules: PasswordRules | null | undefined
}

export function ForcePasswordChangeForm({ username, rules }: Props) {
  const router = useRouter()
  const t = useTranslations("forcePasswordChange")
  const [error, setError] = useState("")

  const forcePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, t("validation.current_required")),
      newPassword: z.string().min(1, t("validation.new_required")),
      confirmPassword: z.string().min(1, t("validation.confirm_required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.mismatch"),
      path: ["confirmPassword"],
    })

  type ForcePasswordFormValues = z.infer<typeof forcePasswordSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForcePasswordFormValues>({
    resolver: zodResolver(forcePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = watch("newPassword")
  const confirmPassword = watch("confirmPassword")
  const validation = rules ? validatePassword(newPassword, rules) : null

  const onSubmit = async (data: ForcePasswordFormValues) => {
    setError("")

    if (validation && !validation.isValid) {
      setError(t("errors.rules_not_met"))
      return
    }

    try {
      await postJson<{ message: string; isFirstPasswordChange?: boolean }>("/api/auth/force-password-change", {
        username,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      toast.success(t("toast.success"))
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PasswordField
        id="currentPassword"
        label={t("fields.current_label")}
        required
        disabled={isSubmitting}
        inputProps={{
          ...register("currentPassword"),
          autoComplete: "current-password",
          "aria-invalid": !!errors.currentPassword,
          "aria-describedby": errors.currentPassword ? "current-password-error" : undefined,
        }}
      />
      {errors.currentPassword?.message && (
        <p id="current-password-error" className="text-sm text-destructive">
          {String(errors.currentPassword.message)}
        </p>
      )}

      <div className="space-y-2">
        <PasswordField
          id="newPassword"
          label={t("fields.new_label")}
          required
          disabled={isSubmitting}
          inputProps={{
            ...register("newPassword"),
            autoComplete: "new-password",
            "aria-invalid": !!errors.newPassword,
            "aria-describedby": errors.newPassword ? "new-password-error" : undefined,
          }}
        />
        {errors.newPassword?.message && (
          <p id="new-password-error" className="text-sm text-destructive">
            {String(errors.newPassword.message)}
          </p>
        )}

        {rules && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3">
            <PasswordRulesList password={newPassword} rules={rules} title={t("rules.title")} />
          </div>
        )}
      </div>

      <PasswordField
        id="confirmPassword"
        label={t("fields.confirm_label")}
        required
        disabled={isSubmitting}
        inputProps={{
          ...register("confirmPassword"),
          autoComplete: "new-password",
          "aria-invalid": !!errors.confirmPassword,
          "aria-describedby": errors.confirmPassword ? "confirm-password-error" : undefined,
        }}
      />
      {errors.confirmPassword?.message && (
        <p id="confirm-password-error" className="text-sm text-destructive">
          {String(errors.confirmPassword.message)}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !!(validation && !validation.isValid)}>
        {isSubmitting ? t("actions.submitting") : t("actions.submit")}
      </Button>
    </form>
  )
}

