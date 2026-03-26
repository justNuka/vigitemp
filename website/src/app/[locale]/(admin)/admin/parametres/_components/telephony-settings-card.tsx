"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { KeyRound, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { TelephonyProviderFields } from "./telephony/telephony-provider-fields"
import { buildSummary, COPY, DEFAULT_DRAFT, STORAGE_KEY } from "./telephony/telephony-settings-helpers"
import type { ProviderId, TelephonyDraft } from "./telephony/telephony-settings-types"

export function TelephonySettingsCard() {
  const locale = useLocale()
  const copy = COPY[locale === "en" ? "en" : "fr"]
  const [draft, setDraft] = useState<TelephonyDraft>(DEFAULT_DRAFT)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { draft?: Partial<TelephonyDraft>; savedAt?: string }
      setDraft({ ...DEFAULT_DRAFT, ...(parsed.draft ?? {}) })
      setSavedAt(parsed.savedAt ?? null)
    } catch {
      setDraft(DEFAULT_DRAFT)
      setSavedAt(null)
    }
  }, [])

  const summary = useMemo(() => buildSummary(draft, copy), [draft, copy])

  const setField = <K extends keyof TelephonyDraft>(key: K, value: TelephonyDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const saveLocal = () => {
    const nextSavedAt = new Date().toISOString()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, savedAt: nextSavedAt }))
    setSavedAt(nextSavedAt)
  }

  const resetLocal = () => {
    setDraft(DEFAULT_DRAFT)
    setSavedAt(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-sky-600" />
              {copy.title}
            </CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="border border-sky-200 bg-sky-50 text-sky-700">
            {copy.localSaved}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-medium">{copy.frontOnly}.</span> {copy.warning}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-background/80 px-3 py-2">
              <Label htmlFor="telephony-enabled">{copy.enabled}</Label>
              <Switch id="telephony-enabled" checked={draft.enabled} onCheckedChange={(checked) => setField("enabled", checked)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{copy.provider}</Label>
            <Select value={draft.provider} onValueChange={(value) => setField("provider", value as ProviderId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{copy.providerLabel.none}</SelectItem>
                <SelectItem value="twilio">{copy.providerLabel.twilio}</SelectItem>
                <SelectItem value="ovhcloud">{copy.providerLabel.ovhcloud}</SelectItem>
                <SelectItem value="keyyo">{copy.providerLabel.keyyo}</SelectItem>
                <SelectItem value="asterisk">{copy.providerLabel.asterisk}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TelephonyProviderFields draft={draft} copy={copy} summary={summary} setField={setField} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            {savedAt
              ? `${copy.localSaved}: ${new Date(savedAt).toLocaleString(locale === "en" ? "en-US" : "fr-FR")}`
              : copy.warning}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetLocal}>
              {copy.reset}
            </Button>
            <Button type="button" onClick={saveLocal}>
              {copy.saveLocal}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
