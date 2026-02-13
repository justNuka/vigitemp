"use client"
import { showFormValidationToast } from "@/lib/form-toast"

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
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const t = useTranslations("resetPassword")

  const resetPasswordSchema = z
    .object({
      newPassword: z.string().min(1, t("validation.new_password_required")),
      confirmPassword: z.string().min(1, t("validation.confirm_required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.password_mismatch"),
      path: ["confirmPassword"],
    })

  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { data: passwordRules } = usePasswordRules()

  const effectiveRules = useMemo(() => getEffectivePasswordRules(passwordRules), [passwordRules])

  const newPassword = watch("newPassword")
  const confirmPassword = watch("confirmPassword")

  const ruleChecks = useMemo(
    () =>
      getPasswordRuleChecks({
        password: newPassword,
        confirmPassword,
        rules: effectiveRules,
        includeConfirmMatch: true,
        t,
      }),
    [confirmPassword, effectiveRules, newPassword],
  )

  const allRulesValid = useMemo(() => areAllPasswordRuleChecksValid(ruleChecks), [ruleChecks])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError("")

    if (!token) {
      setError(t("errors.missing_token"))
      return
    }

    if (!allRulesValid) {
      setError(t("errors.rules_not_met"))
      return
    }

    try {
      await postJson<{ message: string }>("/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      })

      setSuccess(true)

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"))
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-center">{t("invalid_link.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {t("invalid_link.description")}
              </AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              {t("invalid_link.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="text-2xl text-center">{t("success.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("success.description")}
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              {t("success.cta")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl text-center">{t("form.title")}</CardTitle>
          <CardDescription className="text-center">{t("form.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <PasswordField
              id="newPassword"
              label={t("form.fields.new_password_label")}
              required
              disabled={isSubmitting}
              inputProps={{
                ...register("newPassword"),
                placeholder: t("form.fields.new_password_placeholder"),
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

            <PasswordField
              id="confirmPassword"
              label={t("form.fields.confirm_password_label")}
              required
              disabled={isSubmitting}
              inputProps={{
                ...register("confirmPassword"),
                placeholder: t("form.fields.confirm_password_placeholder"),
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

            <PasswordRulesList
              password={newPassword}
              confirmPassword={confirmPassword}
              rules={effectiveRules}
              includeConfirmMatch
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || !allRulesValid}>
              {isSubmitting ? t("form.submit_loading") : t("form.submit")}
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
