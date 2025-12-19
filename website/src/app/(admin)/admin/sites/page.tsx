import { PageHeader } from '@/components/page-header';
import { SitesClient } from './sites-client';

export default function SitesPage() {
  return (
    <>
      <PageHeader
        title="Gestion des Sites"
        description="Créez, modifiez et archivez les sites de votre infrastructure"
      />
      <div className="p-6">
        <SitesClient />
      </div>
    </>
  );
}
