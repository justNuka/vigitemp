import { PageHeader } from "@/components/page-header";
import { ProfilesClient } from "./profiles-client";

export default async function ProfilesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        titleKey="profilesPage.title"
        descriptionKey="profilesPage.description"
      />
      <div className="space-y-6 p-6">
        <ProfilesClient />
      </div>
    </div>
  );
}
