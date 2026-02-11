"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { AdjustmentImportClient } from "./adjustment-import-client";

export default function AjustageImportPage() {
  const t = useTranslations("sensorAdjustmentImport");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="sensorAdjustmentImport.page.title"
        descriptionKey="sensorAdjustmentImport.page.description"
      />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/sondes">{t("page.back_to_sensors")}</Link>
          </Button>
        </div>

        <AdjustmentImportClient />
      </div>
    </div>
  );
}
