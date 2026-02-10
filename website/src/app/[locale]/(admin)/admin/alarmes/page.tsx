"use client";

import { PageHeader } from "@/components/page-header";
import { AlarmsClientTanStack } from "@/components/data-table/alarms-client-tanstack";
import { useTranslations } from "next-intl";

export default function AlarmsPage() {
  const t = useTranslations("adminAlarmsPage");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-6 p-6">
        <AlarmsClientTanStack />
      </div>
    </div>
  );
}
