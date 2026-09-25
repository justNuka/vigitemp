"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2, Mail, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showFormValidationToast } from "@/lib/form-toast"
import { getJson, postJson, putJson } from "@/lib/http"

interface SMTPConfigPayload {
  enabled: boolean
  host: string
  port: number
  user: string
  password: string
  sender: string
  passwordConfigured?: boolean
  configured: boolean
  confirmed: boolean
}

type SMTPConfigFormValues = {
  host: string
  port: number
  user: string
  password?: string
  sender: string
}

type VerificationRequestResponse = {
  recipient: string
  expiresAt: string
  expiresInMinutes: number
}

type SMTPConfigModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SMTPConfigModal({
  open,
  onOpenChange,
}: SMTPConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [passwordConfigured, setPasswordConfigured] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [mode, setMode] = useState<"config" | "verify">("config")
  const [verificationRecipient, setVerificationRecipient] = useState("")
  const queryClient = useQueryClient()
  const t = useTranslations("adminSettings.smtp_modal")

  const smtpSchema = useMemo(
    () =>
      z.object({
        host: z.string().min(1, t("validation.host_required")),
        port: z
          .number()
          .int()
          .min(1, t("validation.port_range"))
          .max(65535, t("validation.port_range")),
        user: z.string().min(1, t("validation.user_required")),
        password: z.string().optional(),
        sender: z
          .string()
          .min(1, t("validation.sender_required"))
          .email(t("validation.email_invalid")),
      }),
    [t],
  )

  const recipientSchema = useMemo(
    () =>
      z.object({
        verificationEmail: z
          .string()
          .min(1, t("validation.test_email_required"))
          .email(t("validation.email_invalid")),
      }),
    [t],
  )

  const codeSchema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .regex(/^\d{6}$/, t("verification.code_invalid")),
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SMTPConfigFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: "",
      port: 587,
      user: "",
      password: "",
      sender: "noreply@vigitemp.fr",
    },
  })

  const {
    register: registerRecipient,
    handleSubmit: handleRecipientSubmit,
    reset: resetRecipient,
    getValues: getRecipientValues,
    formState: { errors: recipientErrors },
  } = useForm<{ verificationEmail: string }>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { verificationEmail: "" },
  })

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    reset: resetCode,
    formState: { errors: codeErrors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  })

  const invalidateStatus = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "smtp-config"] }),
      queryClient.invalidateQueries({
        queryKey: ["admin", "services", "mailing"],
      }),
    ])
  }, [queryClient])

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true)
      const payload = await getJson<SMTPConfigPayload>(
        "/api/admin/configuration-smtp",
      )
      reset({
        host: payload.host,
        port: payload.port,
        user: payload.user,
        password: "",
        sender: payload.sender,
      })
      resetRecipient({
        verificationEmail: payload.sender || payload.user || "",
      })
      resetCode({ code: "" })
      setPasswordConfigured(Boolean(payload.passwordConfigured))
      setConfirmed(payload.confirmed)
      setMode("config")
    } catch (error) {
      console.error("SMTP configuration fetch failed:", error)
      toast.error(t("toasts.fetch_error"))
    } finally {
      setIsLoading(false)
    }
  }, [reset, resetCode, resetRecipient, t])

  useEffect(() => {
    if (open) {
      void fetchConfig()
    }
  }, [fetchConfig, open])

  const saveMutation = useMutation({
    mutationFn: async ({
      config,
      verificationEmail,
    }: {
      config: SMTPConfigFormValues
      verificationEmail: string
    }) => {
      const update = await putJson<{
        message: string
        changed: boolean
        confirmed: boolean
        verificationRequired: boolean
      }>("/api/admin/configuration-smtp", config)

      if (!update.verificationRequired) {
        return {
          update,
          challenge: null as VerificationRequestResponse | null,
        }
      }

      const challenge = await postJson<VerificationRequestResponse>(
        "/api/admin/configuration-smtp/verification/request",
        { toEmail: verificationEmail.trim() },
      )

      return { update, challenge }
    },
    onSuccess: async ({ update, challenge }) => {
      await invalidateStatus()

      if (!update.verificationRequired) {
        toast.success(t("toasts.update_success"))
        onOpenChange(false)
        return
      }

      if (!challenge) return

      setConfirmed(false)
      setVerificationRecipient(challenge.recipient)
      resetCode({ code: "" })
      setMode("verify")
      toast.success(
        t("verification.code_sent", {
          email: challenge.recipient,
          minutes: challenge.expiresInMinutes,
        }),
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("toasts.verification_send_error"),
      )
      void Promise.all([invalidateStatus(), fetchConfig()])
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (code: string) =>
      postJson<{ confirmed: true }>(
        "/api/admin/configuration-smtp/verification/confirm",
        { code },
      ),
    onSuccess: async () => {
      setConfirmed(true)
      await invalidateStatus()
      toast.success(t("verification.confirmed"))
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("verification.confirm_error"),
      )
    },
  })

  const resendMutation = useMutation({
    mutationFn: (toEmail: string) =>
      postJson<VerificationRequestResponse>(
        "/api/admin/configuration-smtp/verification/request",
        { toEmail },
      ),
    onSuccess: (challenge) => {
      setVerificationRecipient(challenge.recipient)
      resetCode({ code: "" })
      toast.success(
        t("verification.code_sent", {
          email: challenge.recipient,
          minutes: challenge.expiresInMinutes,
        }),
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("toasts.verification_send_error"),
      )
    },
  })

  const submitConfiguration = handleSubmit(
    (config) =>
      handleRecipientSubmit(({ verificationEmail }) => {
        saveMutation.mutate({ config, verificationEmail })
      })(),
    (formErrors) => showFormValidationToast(formErrors),
  )

  const busy =
    isLoading ||
    isSubmitting ||
    saveMutation.isPending ||
    confirmMutation.isPending ||
    resendMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border bg-white shadow-xl dark:bg-background sm:rounded-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {mode === "config" ? (
          <form onSubmit={submitConfiguration} className="space-y-4">
            {confirmed ? (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t("verification.currently_confirmed")}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {t("verification.currently_unconfirmed")}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="host">{t("fields.host.label")}</Label>
              <Input
                id="host"
                type="text"
                placeholder={t("fields.host.placeholder")}
                {...register("host")}
                disabled={busy}
                aria-invalid={!!errors.host}
              />
              {errors.host?.message ? (
                <p className="text-sm text-destructive">
                  {String(errors.host.message)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("fields.host.helper")}
              </p>
            </div>

            <div>
              <Label htmlFor="port">{t("fields.port.label")}</Label>
              <Input
                id="port"
                type="number"
                placeholder={t("fields.port.placeholder")}
                {...register("port", { valueAsNumber: true })}
                disabled={busy}
                min="1"
                max="65535"
                aria-invalid={!!errors.port}
              />
              {errors.port?.message ? (
                <p className="text-sm text-destructive">
                  {String(errors.port.message)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("fields.port.helper")}
              </p>
            </div>

            <div>
              <Label htmlFor="user">{t("fields.user.label")}</Label>
              <Input
                id="user"
                type="email"
                placeholder={t("fields.user.placeholder")}
                {...register("user")}
                disabled={busy}
                aria-invalid={!!errors.user}
              />
              {errors.user?.message ? (
                <p className="text-sm text-destructive">
                  {String(errors.user.message)}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="password">{t("fields.password.label")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("fields.password.placeholder")}
                {...register("password")}
                disabled={busy}
                aria-invalid={!!errors.password}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("fields.password.helper")}
              </p>
              {passwordConfigured ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("fields.password.hidden_helper")}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="sender">{t("fields.sender.label")}</Label>
              <Input
                id="sender"
                type="email"
                placeholder={t("fields.sender.placeholder")}
                {...register("sender")}
                disabled={busy}
                aria-invalid={!!errors.sender}
              />
              {errors.sender?.message ? (
                <p className="text-sm text-destructive">
                  {String(errors.sender.message)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("fields.sender.helper")}
              </p>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                {t("verification.recipient_title")}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("verification.recipient_description")}
              </p>
              <Input
                id="smtp-verification-email"
                type="email"
                placeholder={t("test.placeholder")}
                {...registerRecipient("verificationEmail")}
                disabled={busy}
                aria-invalid={!!recipientErrors.verificationEmail}
              />
              {recipientErrors.verificationEmail?.message ? (
                <p className="text-sm text-destructive">
                  {String(recipientErrors.verificationEmail.message)}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                {t("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={busy}>
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {t("verification.save_and_send")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form
            onSubmit={handleCodeSubmit(({ code }) =>
              confirmMutation.mutate(code),
            )}
            className="space-y-5"
          >
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t("verification.enter_code", {
                  email: verificationRecipient,
                })}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="smtp-verification-code">
                {t("verification.code_label")}
              </Label>
              <Input
                id="smtp-verification-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="text-center font-mono text-2xl tracking-[0.4em]"
                placeholder="000000"
                {...registerCode("code")}
                disabled={busy}
                aria-invalid={!!codeErrors.code}
              />
              {codeErrors.code?.message ? (
                <p className="text-sm text-destructive">
                  {String(codeErrors.code.message)}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("config")}
                disabled={busy}
              >
                {t("verification.edit_configuration")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const fallback =
                    verificationRecipient ||
                    getRecipientValues("verificationEmail")
                  if (fallback) resendMutation.mutate(fallback)
                }}
                disabled={busy}
              >
                {resendMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                {t("verification.resend")}
              </Button>
              <Button type="submit" disabled={busy} className="sm:ml-auto">
                {confirmMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {t("verification.confirm_button")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
