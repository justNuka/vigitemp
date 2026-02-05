import { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { ProbesClient } from "./probes-client";

export const metadata: Metadata = {
  title: "Gestion des Sondes - Vigitemp",
  description: "Gestion des sondes, calibrages et étalonnages",
};

export default function SondesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des sondes"
        description="Gestion des sondes, calibrages et étalonnages"
      />

      <div className="space-y-6 p-6">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Chargement…</div>}>
          <ProbesClient />
        </Suspense>
      </div>
    </div>
  );
}
