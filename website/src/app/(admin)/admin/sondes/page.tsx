import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SondesClient } from "./sondes-client";

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
        <SondesClient />
      </div>
    </div>
  );
}
