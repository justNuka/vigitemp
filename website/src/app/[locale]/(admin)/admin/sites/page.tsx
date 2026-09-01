import { PageHeader } from "@/components/page-header";
import { SitesClient } from "./sites-client";

export default function SitesPage() {
  return (
    <>
      <PageHeader
        titleKey="sitesPage.title"
        descriptionKey="sitesPage.description"
      />
      <div className="p-6">
        <SitesClient />
      </div>
    </>
  );
}
