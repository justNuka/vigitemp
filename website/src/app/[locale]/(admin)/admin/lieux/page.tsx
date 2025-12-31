import { PageHeader } from '@/components/page-header';
import { LocationsClient } from './locations-client';

export default function LieuxPage() {
  return (
    <>
      <PageHeader
        title="Gestion des Lieux"
        description="Créez et gérez les lieux de surveillance avec leurs consignes"
      />
      <div className="p-6">
        <LocationsClient />
      </div>
    </>
  );
}
