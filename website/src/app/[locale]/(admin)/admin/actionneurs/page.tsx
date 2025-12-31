import { PageHeader } from "@/components/page-header";
import { ActuatorsClient } from "./actuators-client";

export default function ActionneursPage() {
  return (
    <div>
      <PageHeader
        title="Actionneurs"
        description="Gérer les actionneurs du système"
      />
      <div className="space-y-6 p-6">
        <ActuatorsClient />
      </div>
    </div>
  );
}
