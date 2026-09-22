"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { LicenseBlockedCard } from "@/components/license/license-blocked-card";
import { useLicense } from "@/components/license/license-provider";
import { isPack } from "@/lib/license-access";
import { AdjustmentImportClient } from "./adjustment-import-client";

export default function AjustageImportPage() {
  const t = useTranslations("sensorAdjustmentImport");
  const tCommon = useTranslations("common");
  const { license, loading } = useLicense();
  const isBlocked = useMemo(() => isPack(license), [license]);

  if (loading) {
    return null;
  }

  if (isBlocked) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader
          titleKey="sensorAdjustmentImport.page.title"
          description="Fonctionnalite reservee aux licences One, Standard et Expert."
        />
        <div className="space-y-6 p-6">
          <LicenseBlockedCard
            message="L'import d'ajustage necessite une licence One, Standard ou Expert."
            backLabel={tCommon("back")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="sensorAdjustmentImport.page.title"
        descriptionKey="sensorAdjustmentImport.page.description"
      />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/sondes">{t("page.back_to_sensors")}</Link>
          </Button>
        </div>

        <Alert>
          <AlertTitle>{t("page.gsp_gso_title")}</AlertTitle>
          <AlertDescription>{t("page.gsp_gso_description")}</AlertDescription>
        </Alert>

        <AdjustmentImportClient />
      </div>
    </div>
  );
}
