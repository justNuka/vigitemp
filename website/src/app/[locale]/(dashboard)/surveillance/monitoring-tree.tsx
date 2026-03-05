"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Accordion } from "@/components/ui/accordion";
import type { SensorWithLocation } from "@/lib/api";
import { buildSurveillanceTree } from "./_components/build-monitoring-tree";
import { SurveillanceTreeSiteItem } from "./_components/monitoring-tree-site-item";
import { usePersistentStringSet } from "./_hooks/use-persistent-string-set";
import { SurveillanceEmptyState } from "./_components/monitoring-empty-state";

interface SurveillanceTreeProps {
  sensors: SensorWithLocation[];
}

export function SurveillanceTree({ sensors }: SurveillanceTreeProps) {
  const t = useTranslations("surveillance");
  const treeLabels = useMemo(
    () => ({ noGroup: t("grid.no_group"), noSite: t("grid.no_site") }),
    [t],
  );
  const tree = useMemo(() => buildSurveillanceTree(sensors, treeLabels), [sensors, treeLabels]);
  const defaultExpandedSites = useMemo(() => tree.map((site) => `site-${site.siteId}`), [tree]);
  const { value: expandedSites, replace: setExpandedSites } = usePersistentStringSet(
    "surveillance-tree-expanded-sites",
    { defaultValue: defaultExpandedSites },
  );

  if (tree.length === 0) {
    return <SurveillanceEmptyState />;
  }

  return (
    <div className="w-full">
      <Accordion
        type="multiple"
        className="w-full space-y-4"
        value={Array.from(expandedSites)}
        onValueChange={setExpandedSites}
      >
        {tree.map((site) => (
          <SurveillanceTreeSiteItem key={`site-${site.siteId}`} site={site} />
        ))}
      </Accordion>
    </div>
  );
}
