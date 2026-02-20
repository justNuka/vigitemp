"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { CalibrationImportClient } from "./calibration-import-client";
import { useLicense } from "@/components/license/license-provider";
import { isOneOrPack } from "@/lib/license-access";
import { LicenseBlockedCard } from "@/components/license/license-blocked-card";

export default function EtalonnageImportPage() {
  const locale = useLocale();
  const t = useTranslations("sensorCalibrationImport");
  const tCommon = useTranslations("common");
  const { license, loading } = useLicense();

  const isBlocked = useMemo(() => isOneOrPack(license), [license]);

  if (loading) {
    return null;
  }

  if (isBlocked) {
    const blockedTitle =
      locale === "fr"
        ? "Import d'étalonnage indisponible"
        : "Calibration import unavailable";
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
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="sensorCalibrationImport.page.title"
        descriptionKey="sensorCalibrationImport.page.description"
      />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">{t("page.back_to_admin")}</Link>
          </Button>
        </div>

        <CalibrationImportClient />
      </div>
    </div>
  );
}
