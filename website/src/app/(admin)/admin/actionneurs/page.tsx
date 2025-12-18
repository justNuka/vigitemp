import { PageHeader } from "@/components/page-header";
import { ActionneursClient } from "./actionneurs-client";

export default function ActionneursPage() {
  return (
    <div>
      <PageHeader
        title="Actionneurs"
        description="Gérer les actionneurs du système"
      />
      <div className="space-y-6 p-6">
        <ActionneursClient />
      </div>
    </div>
  );
}
