import { PageHeader } from "@/components/page-header";
import { SitesClient } from "./sites-client";

export default function SitesPage() {
  return (
    <>
      <PageHeader
        titleKey="sitesPage.title"
        descriptionKey="sitesPage.description"
      />
      <div className="mx-auto w-full max-w-[1680px] p-4 md:p-6">
        <SitesClient />
      </div>
    </>
  );
}
