"use client"

import { AlertTriangle, BookOpen, CheckCircle2, Mail } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SwitchWithLoading } from "@/components/ui/switch-with-loading"
import { getJson, patchJson } from "@/lib/http"

type SmtpSettingsCardProps = {
  onOpenSmtpModal: () => void
  onOpenSmtpGuide: () => void
}

type SmtpConfigResponse = {
  enabled: boolean
  configured: boolean
  confirmed: boolean
}

export function SmtpSettingsCard({
  onOpenSmtpModal,
  onOpenSmtpGuide,
}: SmtpSettingsCardProps) {
  const t = useTranslations("adminSettings")
  const queryClient = useQueryClient()

  const smtpQuery = useQuery({
    queryKey: ["admin", "smtp-config"],
    queryFn: () =>
      getJson<SmtpConfigResponse>("/api/admin/configuration-smtp"),
    staleTime: 10_000,
  })

  const activationMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      patchJson<{ enabled: boolean }>("/api/admin/configuration-smtp", {
        enabled,
      }),
    onSuccess: async ({ enabled }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "smtp-config"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "services", "mailing"],
        }),
      ])
      toast.success(
        enabled
          ? t("smtp.activation_enabled")
          : t("smtp.activation_disabled"),
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("smtp.activation_error"),
      )
    },
  })

  const enabled = smtpQuery.data?.enabled ?? false
  const configured = smtpQuery.data?.configured ?? false
  const confirmed = smtpQuery.data?.confirmed ?? false

  return (
    <Card className="mb-8 border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("smtp.title")}
            </CardTitle>
            <CardDescription>{t("smtp.description")}</CardDescription>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-medium">{t("smtp.activation_label")}</p>
              <p className="text-xs text-muted-foreground">
                {enabled
                  ? t("smtp.activation_on")
                  : t("smtp.activation_off")}
              </p>
            </div>
            <SwitchWithLoading
              checked={enabled}
              onCheckedChange={(checked) =>
                activationMutation.mutate(checked)
              }
              isLoading={
                smtpQuery.isLoading || activationMutation.isPending
              }
              aria-label={t("smtp.activation_label")}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {enabled ? (
          <>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("smtp.warning_label")}</strong>{" "}
                {t("smtp.warning_body")}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap items-center gap-2">
              {configured && confirmed ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  {t("smtp.confirmed")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive"
                >
                  {configured
                    ? t("smtp.not_confirmed")
                    : t("smtp.not_configured")}
                </Badge>
              )}
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {enabled ? (
            <Button
              onClick={onOpenSmtpModal}
              variant="default"
              className="w-full sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("smtp.configure_button")}
            </Button>
          ) : null}

          <Button
            onClick={onOpenSmtpGuide}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            {t("smtp.guide_button")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
