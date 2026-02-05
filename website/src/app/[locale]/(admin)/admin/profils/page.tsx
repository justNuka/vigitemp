import { PageHeader } from "@/components/page-header";
import { ProfilesClient } from "./profiles-client";

export default async function ProfilesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des profils"
        description="Administration des profils et autorisations"
      />
      <div className="space-y-6 p-6">
        <ProfilesClient />
      </div>
    </div>
  );
}
