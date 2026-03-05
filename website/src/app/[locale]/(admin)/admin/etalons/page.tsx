"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack } from "@/lib/license-access";
import { PageHeader } from "@/components/page-header";
import { LicenseBlockedCard } from "@/components/license/license-blocked-card";
import { StandardsClient } from "./standards-client";

export default function EtalonsPage() {
  const t = useTranslations("standardsPage")
  const tCommon = useTranslations("common")
  const { license, loading } = useLicense();

  const isBlocked = useMemo(() => isOneOrPack(license), [license]);

  if (loading) {
    return null;
  }

  if (isBlocked) {
    const blockedTitle = t("blocked.title")
    const blockedDescription = t("blocked.description")

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
      <PageHeader titleKey="standardsPage.title" descriptionKey="standardsPage.description" />
      <div className="space-y-6 p-6">
        <StandardsClient />
      </div>
    </>
  );
}
