import { Gauge, MapPinned, Settings, ShieldAlert, Thermometer, Users } from "lucide-react";

import { DashboardLinkCard } from "@/components/dashboard-link-card";
import { PageHeader } from "@/components/page-header";
import { getTranslations } from "@/i18n/server";

type DashboardOneProps = {
  locale: string;
};

export async function DashboardOne({ locale }: DashboardOneProps) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tLinks = await getTranslations({ locale, namespace: "dashboard.one.links" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("one.title")} description={t("one.subtitle")} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardLinkCard
          title={tLinks("surveillance.title")}
          description={tLinks("surveillance.description")}
          href={`/${locale}/surveillance`}
          icon={<Gauge className="h-5 w-5" />}
        />
        <DashboardLinkCard
          title={tLinks("alarmes.title")}
          description={tLinks("alarmes.description")}
          href={`/${locale}/alarmes`}
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <DashboardLinkCard
          title={tLinks("lieux.title")}
          description={tLinks("lieux.description")}
          href={`/${locale}/admin/lieux`}
          icon={<MapPinned className="h-5 w-5" />}
        />
        <DashboardLinkCard
          title={tLinks("sondes.title")}
          description={tLinks("sondes.description")}
          href={`/${locale}/admin/sondes`}
          icon={<Thermometer className="h-5 w-5" />}
        />
        <DashboardLinkCard
          title={tLinks("utilisateurs.title")}
          description={tLinks("utilisateurs.description")}
          href={`/${locale}/admin/utilisateurs`}
          icon={<Users className="h-5 w-5" />}
        />
        <DashboardLinkCard
          title={tLinks("parametres.title")}
          description={tLinks("parametres.description")}
          href={`/${locale}/admin/parametres`}
          icon={<Settings className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
