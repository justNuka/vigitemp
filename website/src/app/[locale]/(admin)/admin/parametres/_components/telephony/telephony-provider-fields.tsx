import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import type { ProviderId, TelephonyCopy, TelephonyDraft, TwilioAuthMode } from "./telephony-settings-types"

type SetField = <K extends keyof TelephonyDraft>(key: K, value: TelephonyDraft[K]) => void

export function TelephonyProviderFields({
  draft,
  copy,
  summary,
  setField,
}: {
  draft: TelephonyDraft
  copy: TelephonyCopy
  summary: string[]
  setField: SetField
}) {
  if (draft.provider === "none") return null

  return (
    <div className="rounded-xl border bg-background/85 p-4">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">{copy.providerDesc[draft.provider]}</div>

      {draft.provider === "twilio" ? <TwilioFields draft={draft} copy={copy} setField={setField} /> : null}
      {draft.provider === "ovhcloud" ? <OvhFields draft={draft} copy={copy} setField={setField} /> : null}
      {draft.provider === "keyyo" ? <KeyyoFields draft={draft} copy={copy} setField={setField} /> : null}
      {draft.provider === "asterisk" ? <AsteriskFields draft={draft} copy={copy} setField={setField} /> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2">
          <Label>{copy.notes}</Label>
          <Textarea value={draft.notes} onChange={(e) => setField("notes", e.target.value)} rows={5} placeholder={copy.notesPlaceholder} />
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 text-sm font-medium">{copy.summary}</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            {summary.length > 0 ? summary.map((line) => <p key={line}>{line}</p>) : <p>?</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TwilioFields({ draft, copy, setField }: { draft: TelephonyDraft; copy: TelephonyCopy; setField: SetField }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{copy.authMethod}</Label>
        <Select value={draft.twilioAuthMode} onValueChange={(value) => setField("twilioAuthMode", value as TwilioAuthMode)}>
          <SelectTrigger className="md:w-[320px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api_key">{copy.twilio.apiKey}</SelectItem>
            <SelectItem value="auth_token">{copy.twilio.authToken}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={copy.twilio.accountSid} value={draft.twilioAccountSid} onChange={(value) => setField("twilioAccountSid", value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        <Field label={copy.twilio.fromNumber} value={draft.twilioFromNumber} onChange={(value) => setField("twilioFromNumber", value)} placeholder="+33123456789" />
        {draft.twilioAuthMode === "api_key" ? (
          <>
            <Field label={copy.twilio.apiKeySid} value={draft.twilioApiKeySid} onChange={(value) => setField("twilioApiKeySid", value)} placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
            <Field label={copy.twilio.apiKeySecret} value={draft.twilioApiKeySecret} onChange={(value) => setField("twilioApiKeySecret", value)} placeholder="secret" type="password" />
          </>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Field label={copy.twilio.authTokenField} value={draft.twilioAuthToken} onChange={(value) => setField("twilioAuthToken", value)} placeholder="auth token" type="password" />
          </div>
        )}
      </div>
    </div>
  )
}

function OvhFields({ draft, copy, setField }: { draft: TelephonyDraft; copy: TelephonyCopy; setField: SetField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>{copy.ovh.endpoint}</Label>
        <Select value={draft.ovhEndpoint} onValueChange={(value) => setField("ovhEndpoint", value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ovh-eu">ovh-eu</SelectItem>
            <SelectItem value="ovh-us">ovh-us</SelectItem>
            <SelectItem value="ovh-ca">ovh-ca</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Field label={copy.callerId} value={draft.callerId} onChange={(value) => setField("callerId", value)} placeholder="+33123456789" />
      <Field label={copy.ovh.applicationKey} value={draft.ovhApplicationKey} onChange={(value) => setField("ovhApplicationKey", value)} placeholder="AK..." />
      <Field label={copy.ovh.applicationSecret} value={draft.ovhApplicationSecret} onChange={(value) => setField("ovhApplicationSecret", value)} placeholder="AS..." type="password" />
      <Field label={copy.ovh.consumerKey} value={draft.ovhConsumerKey} onChange={(value) => setField("ovhConsumerKey", value)} placeholder="CK..." type="password" />
      <Field label={copy.ovh.billingAccount} value={draft.ovhBillingAccount} onChange={(value) => setField("ovhBillingAccount", value)} placeholder="billing account" />
      <div className="space-y-2 md:col-span-2">
        <Field label={copy.ovh.serviceName} value={draft.ovhServiceName} onChange={(value) => setField("ovhServiceName", value)} placeholder="serviceName" />
      </div>
    </div>
  )
}

function KeyyoFields({ draft, copy, setField }: { draft: TelephonyDraft; copy: TelephonyCopy; setField: SetField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={copy.keyyo.clientId} value={draft.keyyoClientId} onChange={(value) => setField("keyyoClientId", value)} placeholder="client_id" />
      <Field label={copy.keyyo.clientSecret} value={draft.keyyoClientSecret} onChange={(value) => setField("keyyoClientSecret", value)} placeholder="client_secret" type="password" />
      <Field label={copy.keyyo.accessToken} value={draft.keyyoAccessToken} onChange={(value) => setField("keyyoAccessToken", value)} placeholder="access token" type="password" />
      <Field label={copy.keyyo.refreshToken} value={draft.keyyoRefreshToken} onChange={(value) => setField("keyyoRefreshToken", value)} placeholder="refresh token" type="password" />
      <div className="space-y-2 md:col-span-2">
        <Field label={copy.keyyo.lineId} value={draft.keyyoLineId} onChange={(value) => setField("keyyoLineId", value)} placeholder="CSI / line identifier" />
      </div>
    </div>
  )
}

function AsteriskFields({ draft, copy, setField }: { draft: TelephonyDraft; copy: TelephonyCopy; setField: SetField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Field label={copy.asterisk.baseUrl} value={draft.asteriskBaseUrl} onChange={(value) => setField("asteriskBaseUrl", value)} placeholder="http://127.0.0.1:8088/ari" />
      </div>
      <Field label={copy.asterisk.username} value={draft.asteriskUsername} onChange={(value) => setField("asteriskUsername", value)} placeholder="ari-user" />
      <Field label={copy.asterisk.password} value={draft.asteriskPassword} onChange={(value) => setField("asteriskPassword", value)} placeholder="password" type="password" />
      <div className="space-y-2 md:col-span-2">
        <Field label={copy.asterisk.appName} value={draft.asteriskAppName} onChange={(value) => setField("asteriskAppName", value)} placeholder="vigitemp" />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
    </div>
  )
}
