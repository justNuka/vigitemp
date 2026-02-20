"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack } from "@/lib/license-access";
import { PageHeader } from "@/components/page-header";
import { LicenseBlockedCard } from "@/components/license/license-blocked-card";
import { StandardsClient } from "./standards-client";

export default function EtalonsPage() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const { license, loading } = useLicense();

  const isBlocked = useMemo(() => isOneOrPack(license), [license]);

  if (loading) {
    return null;
  }

  if (isBlocked) {
    const blockedTitle = locale === "fr" ? "Gestion des étalons indisponible" : "Standards management unavailable";
    const blockedDescription =
      locale === "fr"
        ? "Cette page n'est pas disponible avec votre licence actuelle."
        : "This page is not available with your current license.";

    return (
      <>
        <PageHeader title={blockedTitle} description={blockedDescription} />
        <div className="space-y-6 p-6">
          <LicenseBlockedCard message={blockedDescription} backLabel={tCommon("back")} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestion des étalons" description="Gérez les étalons de calibration" />
      <div className="space-y-6 p-6">
        <StandardsClient />
      </div>
    </>
  );
}
