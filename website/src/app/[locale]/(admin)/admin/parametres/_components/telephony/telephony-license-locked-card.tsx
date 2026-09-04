"use client"

import { useLocale } from "next-intl"
import { Phone } from "lucide-react"

import { LicenseFeatureLock } from "@/components/license/license-feature-lock"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { COPY } from "./telephony-settings-helpers"

export function TelephonyLicenseLockedCard() {
  const locale = useLocale()
  const copy = COPY[locale === "en" ? "en" : "fr"]
  const isEnglish = locale === "en"

  return (
    <LicenseFeatureLock
      title={isEnglish ? "Feature not available with your license" : "Fonctionnalité non disponible avec votre licence"}
      description={
        isEnglish
          ? "The telephony option must be enabled in the VigiSensys license to configure or use voice calls."
          : "L’option téléphonie doit être activée dans la licence VigiSensys pour configurer ou utiliser les appels vocaux."
      }
    >
      <Card className="min-h-[430px] border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-sky-600" />
                {copy.title}
              </CardTitle>
              <CardDescription>{copy.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
              Twilio V1
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground/85 dark:border-primary/25 dark:bg-primary/12">
            {copy.warning}
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <div className="space-y-2">
              <Label>{copy.enabled}</Label>
              <div className="flex h-10 items-center justify-between rounded-lg border border-border/60 bg-white px-3 shadow-sm dark:bg-card">
                <span className="text-sm font-medium">{copy.enabled}</span>
                <Switch checked={false} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{copy.provider}</Label>
              <Input value={copy.providerLabel.twilio} disabled readOnly />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{copy.twilio.accountSid}</Label>
              <Input value="AC••••••••••••••••" disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label>{copy.twilio.fromNumber}</Label>
              <Input value="+33 • •• •• •• ••" disabled readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
    </LicenseFeatureLock>
  )
}
