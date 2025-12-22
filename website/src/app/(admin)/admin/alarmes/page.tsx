import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AlarmsClient } from "./alarms-client";

export const metadata: Metadata = {
  title: "Gestion des Alarmes - Vigitemp",
  description: "Gestion et suivi des alarmes",
};

export default function AlarmsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des alarmes"
        description="Suivi et gestion de toutes les alarmes"
      />

      <div className="space-y-6 p-6">
        <AlarmsClient />
      </div>
    </div>
  );
}
