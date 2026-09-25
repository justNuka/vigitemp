"use client"

import { Mail, Phone } from "lucide-react"
import { useTranslations } from "next-intl"

import { LicenseFeatureLock } from "@/components/license/license-feature-lock"
import { useLicense } from "@/components/license/license-provider"
import {
  useMailingServiceStatus,
  useTelephonyServiceStatus,
} from "@/hooks/useAdminServiceStatus"
import type { TelephonyProviderId } from "@/lib/admin-service-status"
import { hasLicenseOption } from "@/lib/license-access"
import {
  AdminServiceCard,
  type AdminServiceCardState,
} from "./admin-service-card"

function resolveState({
  loading,
  error,
  enabled,
  configured,
}: {
  loading: boolean
  error: boolean
  enabled?: boolean
  configured?: boolean
}): AdminServiceCardState {
  if (loading) return "loading"
  if (error) return "error"
  if (enabled && !configured) return "incomplete"
  return enabled ? "active" : "inactive"
}

export function AdminServiceCards() {
  const t = useTranslations("adminServiceCards")
  const { license, loading: licenseLoading } = useLicense()
  const canUseTelephony = hasLicenseOption(license, "telephonie")
  const mailingQuery = useMailingServiceStatus()
  const telephonyQuery = useTelephonyServiceStatus(!licenseLoading && canUseTelephony)

  const mailing = mailingQuery.data
  const mailingState = resolveState({
    loading: mailingQuery.isLoading,
    error: mailingQuery.isError,
    enabled: mailing?.enabled,
    configured: mailing?.configured && mailing?.confirmed,
  })

  const mailingConfiguredLabel = mailingQuery.isLoading
    ? "—"
    : mailing?.configured
      ? t("configuration.configured")
      : t("configuration.incomplete")

  const mailingConfirmedLabel = mailingQuery.isLoading
    ? "—"
    : mailing?.confirmed
      ? t("mailing.confirmed")
      : t("mailing.not_confirmed")

  const mailingEnabledLabel = mailingQuery.isLoading
    ? "—"
    : mailing?.enabled
      ? t("status.active")
      : t("status.inactive")

  const telephony = telephonyQuery.data
  const telephonyState = resolveState({
    loading: licenseLoading || telephonyQuery.isLoading,
    error: telephonyQuery.isError,
    enabled: telephony?.enabled,
    configured: telephony?.configured,
  })

  const telephonyProvider = telephony?.provider
  const providerLabel = telephonyProvider
    ? t(`telephony.providers.${telephonyProvider as TelephonyProviderId}`)
    : "—"

  const telephonyConfiguredLabel = telephonyQuery.isLoading
    ? "—"
    : telephony?.configured
      ? t("configuration.configured")
      : t("configuration.incomplete")

  return (
    <>
      <AdminServiceCard
        title={t("mailing.title")}
        description={t("mailing.description")}
        icon={Mail}
        state={mailingState}
        stateLabel={t(`status.${mailingState}`)}
        details={[
          { label: t("mailing.activation"), value: mailingEnabledLabel, ok: mailing ? mailing.enabled || null : undefined },
          { label: t("mailing.configuration"), value: mailingConfiguredLabel, ok: mailing ? mailing.configured : undefined },
          { label: t("mailing.confirmation"), value: mailingConfirmedLabel, ok: mailing ? mailing.confirmed : undefined },
        ]}
        href="/admin/parametres"
        hrefLabel={t("actions.open_settings")}
      />

      {licenseLoading ? (
        <AdminServiceCard
          title={t("telephony.title")}
          description={t("telephony.description")}
          icon={Phone}
          state="loading"
          stateLabel={t("status.loading")}
          details={[
            { label: t("telephony.provider"), value: "—" },
            { label: t("telephony.configuration"), value: "—" },
          ]}
        />
      ) : canUseTelephony ? (
        <AdminServiceCard
          title={t("telephony.title")}
          description={t("telephony.description")}
          icon={Phone}
          state={telephonyState}
          stateLabel={t(`status.${telephonyState}`)}
          details={[
            { label: t("telephony.provider"), value: providerLabel },
            { label: t("telephony.configuration"), value: telephonyConfiguredLabel, ok: telephony ? telephony.configured : undefined },
          ]}
          href="/admin/parametres"
          hrefLabel={t("actions.open_settings")}
        />
      ) : (
        <LicenseFeatureLock
          title={t("telephony.license_locked_title")}
          description={t("telephony.license_locked_description")}
          className="h-full"
        >
          <AdminServiceCard
            title={t("telephony.title")}
            description={t("telephony.description")}
            icon={Phone}
            state="inactive"
            stateLabel={t("telephony.license_required")}
            details={[
              { label: t("telephony.provider"), value: t("telephony.providers.twilio") },
              { label: t("telephony.configuration"), value: t("telephony.license_required") },
            ]}
          />
        </LicenseFeatureLock>
      )}
    </>
  )
}
