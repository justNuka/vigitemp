import { PageHeader } from "@/components/page-header";
import { GroupsClient } from "./groups-client";

export default function GroupesPage() {
  return (
    <>
      <PageHeader
        title="Groupes"
        description="Gestion des groupes de lieux"
      />
      <div className="space-y-6 p-6">
        <GroupsClient />
      </div>
    </>
  );
}
