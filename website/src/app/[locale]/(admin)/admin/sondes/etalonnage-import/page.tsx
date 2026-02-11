"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { CalibrationImportClient } from "./calibration-import-client";

export default function EtalonnageImportPage() {
  const t = useTranslations("sensorCalibrationImport");

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
