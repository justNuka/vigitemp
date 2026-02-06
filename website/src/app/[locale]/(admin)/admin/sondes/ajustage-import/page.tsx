"use client";

import { PageHeader } from "@/components/page-header";
import { AdjustmentImportClient } from "./adjustment-import-client";

export default function AjustageImportPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="sensorAdjustmentImport.page.title"
        descriptionKey="sensorAdjustmentImport.page.description"
      />

      <div className="space-y-6 p-6">
        <AdjustmentImportClient />
      </div>
    </div>
  );
}

