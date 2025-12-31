"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { TreeNode } from "./monitoring-tree-types";
import { SurveillanceTreeGroupItem } from "./monitoring-tree-group-item";
import { SurveillanceTreeStatsBadges } from "./monitoring-tree-stats-badges";
import { usePersistentStringValue } from "../_hooks/use-persistent-string-value";
import { formatAlarmes, formatGroupes, formatSondes } from "../_helpers/monitoring-labels";

export function SurveillanceTreeSiteItem({ site }: { site: TreeNode }) {
  const storageKey = `surveillance-tree-expanded-group-site-${site.siteId}`;
  const { value: expandedGroup, set: setExpandedGroup } = usePersistentStringValue(storageKey);
  const alarmsCount = site.stats.critical + site.stats.warning;

  return (
    <AccordionItem
      key={`site-${site.siteId}`}
      value={`site-${site.siteId}`}
      className="border rounded-xl overflow-hidden shadow-sm dark:border-gray-700"
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 dark:hover:bg-gray-800/50">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3 flex-1 text-left">
            <div>
              <h3 className="font-semibold">{site.siteName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatSondes(site.stats.total)} • {formatGroupes(site.groups.length)}
                {alarmsCount > 0 ? ` • ${formatAlarmes(alarmsCount)}` : ""}
              </p>
            </div>
          </div>

          <SurveillanceTreeStatsBadges stats={site.stats} />
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-0">
        <div className="space-y-2 pl-4 pr-4 pb-4">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
            value={expandedGroup}
            onValueChange={setExpandedGroup}
          >
            {site.groups.map((group, idx) => (
              <SurveillanceTreeGroupItem
                key={`${site.siteId}-group-${group.groupId ?? idx}`}
                siteId={site.siteId}
                groupId={group.groupId}
                groupName={group.groupName}
                sensors={group.sensors}
                stats={group.stats}
                indexFallback={idx}
              />
            ))}
          </Accordion>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
