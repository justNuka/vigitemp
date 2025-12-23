import { PageHeader } from "@/components/page-header";
import { EtalonsClient } from "./etalons-client";

export default function EtalonsPage() {
  return (
    <>
      <PageHeader
        title="Gestion des étalons"
        description="Gérez les étalons de calibration"
      />
      <div className="space-y-6 p-6">
        <EtalonsClient />
      </div>
    </>
  );
}
