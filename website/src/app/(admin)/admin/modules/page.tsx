import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ModulesClient } from "./module-client";

export const metadata: Metadata = {
  title: "Gestion des modules - Vigitemp",
  description: "Gestion des modules",
};

export default function ModulesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des modules"
        description="Gestion des modules"
      />

      <div className="space-y-6 p-6">
        <ModulesClient />
      </div>
    </div>
  );
}
