import { PageHeader } from "@/components/page-header"
import { LocationTemplatesClient } from "./templates-client"

export default function LocationTemplatesPage() {
  return (
    <>
      <PageHeader titleKey="locationTemplatesPage.title" descriptionKey="locationTemplatesPage.description" />
      <div className="p-6">
        <LocationTemplatesClient />
      </div>
    </>
  )
}

