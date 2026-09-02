"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { KeyRound, Loader2, Phone } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { fetchJson, postJson, putJson } from "@/lib/http"
import { formatDbDateTime } from "@/lib/date-display"
import { TelephonyProviderFields } from "./telephony/telephony-provider-fields"
import { TelephonyOvhSetupGuideDialog } from "./telephony/telephony-ovh-setup-guide-dialog"
import { buildSummary, COPY, DEFAULT_DRAFT } from "./telephony/telephony-settings-helpers"
import type { ProviderId, TelephonyDraft } from "./telephony/telephony-settings-types"

export function TelephonySettingsCard() {
  const locale = useLocale()
  const tCommon = useTranslations("common")
  const copy = COPY[locale === "en" ? "en" : "fr"]
  const [draft, setDraft] = useState<TelephonyDraft>(DEFAULT_DRAFT)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [testingCall, setTestingCall] = useState(false)
  const [testNumber, setTestNumber] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const config = await fetchJson<TelephonyDraft>("/api/admin/telephony/config", { credentials: "include" })
        if (!cancelled) {
          setDraft({ ...DEFAULT_DRAFT, ...config })
          setSavedAt(new Date().toISOString())
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Impossible de charger la configuration téléphonie")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => buildSummary(draft, copy), [draft, copy])

  const setField = <K extends keyof TelephonyDraft>(key: K, value: TelephonyDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const saveServer = async () => {
    setSaving(true)
    try {
      await putJson("/api/admin/telephony/config", draft)
      setSavedAt(new Date().toISOString())
      toast.success("Configuration téléphonie enregistrée")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer la configuration téléphonie")
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      const result = await postJson<{ click2CallUsers: Array<{ id: number; login: string }> }>("/api/admin/telephony/ovh/test-connection", {})
      toast.success(`Connexion OVH OK (${result.click2CallUsers.length} utilisateur(s) Click2Call)`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test de connexion OVH impossible")
    } finally {
      setTestingConnection(false)
    }
  }

  const createClick2CallUser = async () => {
    setCreatingUser(true)
    try {
      const result = await postJson<{ id: number; login: string }>("/api/admin/telephony/ovh/click2call-users", {})
      setDraft((prev) => ({ ...prev, ovhClick2CallUserId: String(result.id) }))
      setSavedAt(new Date().toISOString())
      toast.success(copy.userCreated)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de créer l'utilisateur Click2Call")
    } finally {
      setCreatingUser(false)
    }
  }

  const testCall = async () => {
    setTestingCall(true)
    try {
      await postJson("/api/admin/telephony/ovh/test-call", { to: testNumber })
      toast.success(`Appel de test lancé vers ${testNumber}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de lancer l'appel de test")
    } finally {
      setTestingCall(false)
    }
  }

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT)
    setSavedAt(null)
  }

  const ovhActionsVisible = draft.provider === "ovhcloud"

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-sky-600" />
              {copy.title}
            </CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TelephonyOvhSetupGuideDialog />
            <Badge variant="secondary" className="border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
              {draft.provider === "ovhcloud" ? "OVH V1" : copy.localSaved}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground/85 dark:border-primary/25 dark:bg-primary/12">
          {copy.warning}
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:items-end">
          <div className="space-y-2">
            <Label htmlFor="telephony-enabled">{copy.enabled}</Label>
            <div className="flex h-10 items-center justify-between rounded-lg border border-border/60 bg-white px-3 shadow-sm dark:bg-card">
              <span className="text-sm font-medium">{copy.enabled}</span>
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

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {tCommon("loading")}</div>
        ) : (
          <>
            <TelephonyProviderFields draft={draft} copy={copy} summary={summary} setField={setField} />

            {ovhActionsVisible ? (
              <div className="grid gap-4 rounded-xl border border-border/60 bg-white p-4 shadow-sm dark:bg-card md:grid-cols-[1fr_auto_auto] md:items-end">
                <div className="space-y-2">
                  <Label>{copy.testNumber}</Label>
                  <Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder={copy.testNumberPlaceholder} />
                </div>
                <Button type="button" variant="outline" onClick={testConnection} disabled={testingConnection || saving}>
                  {testingConnection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {copy.testConnection}
                </Button>
                <Button type="button" variant="outline" onClick={createClick2CallUser} disabled={creatingUser || saving}>
                  {creatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {copy.createClick2CallUser}
                </Button>
                <div className="md:col-span-3 flex justify-end">
                  <Button type="button" onClick={testCall} disabled={testingCall || saving || !testNumber.trim()}>
                    {testingCall ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {copy.testCall}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            {savedAt
              ? `${copy.localSaved}: ${formatDbDateTime(savedAt, { format: "dateTimeSeconds", locale: locale === "en" ? "en-US" : "fr-FR" })}`
              : copy.warning}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetDraft} disabled={saving}>
              {copy.reset}
            </Button>
            <Button type="button" onClick={saveServer} disabled={saving || loading}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {copy.saveServer}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
