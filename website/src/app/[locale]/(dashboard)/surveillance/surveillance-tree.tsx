'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Zap, Power } from 'lucide-react';
import type { SensorWithLocation } from '@/lib/api';

interface SurveillanceTreeProps {
  sensors: SensorWithLocation[];
}

interface TreeNode {
  siteId: number;
  siteName: string;
  groups: {
    groupId: number | null;
    groupName: string;
    sensors: SensorWithLocation[];
    stats: {
      total: number;
      ok: number;
      warning: number;
      critical: number;
      inactive: number;
    };
  }[];
  stats: {
    total: number;
    ok: number;
    warning: number;
    critical: number;
    inactive: number;
  };
}

function getStatusColor(
  status: 'ok' | 'warning' | 'critical',
  isActive: boolean
): { bg: string; text: string; icon: React.ReactNode } {
  if (!isActive) {
    return {
      bg: 'bg-gray-100 dark:bg-gray-900',
      text: 'text-gray-500 dark:text-gray-400',
      icon: <Power className="w-4 h-4" />,
    };
  }

  switch (status) {
    case 'critical':
      return {
        bg: 'bg-red-50 dark:bg-red-950',
        text: 'text-red-700 dark:text-red-300',
        icon: <AlertCircle className="w-4 h-4" />,
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: <Zap className="w-4 h-4" />,
      };
    case 'ok':
    default:
      return {
        bg: 'bg-green-50 dark:bg-green-950',
        text: 'text-green-700 dark:text-green-300',
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
  }
}

function getStatusBadge(status: string, isActive: boolean) {
  if (!isActive) {
    return (
      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
        <Power className="w-3 h-3 mr-1" /> Désactivée
      </Badge>
    );
  }

  switch (status) {
    case 'critical':
      return (
        <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
          <AlertCircle className="w-3 h-3 mr-1" /> Critique
        </Badge>
      );
    case 'warning':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Zap className="w-3 h-3 mr-1" /> Attention
        </Badge>
      );
    case 'ok':
    default:
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" /> OK
        </Badge>
      );
  }
}

export function SurveillanceTree({ sensors }: SurveillanceTreeProps) {
  const tree = useMemo(() => {
    const sitesMap = new Map<number, TreeNode>();

    sensors.forEach((sensor) => {
      const siteId = sensor.location?.siteId || 0;
      const siteName = sensor.location?.site || 'Sans site';

      const groupIds =
        sensor.location?.groupIds && sensor.location.groupIds.length > 0
          ? sensor.location.groupIds
          : [sensor.location?.groupId1 ?? null, sensor.location?.groupId2 ?? null].filter(
              (id): id is number => typeof id === 'number' && !Number.isNaN(id)
            );

      if (!sitesMap.has(siteId)) {
        sitesMap.set(siteId, {
          siteId,
          siteName,
          groups: [],
          stats: { total: 0, ok: 0, warning: 0, critical: 0, inactive: 0 },
        });
      }

      const siteNode = sitesMap.get(siteId)!;

      const effectiveGroupIds = groupIds.length > 0 ? groupIds : [null];
      effectiveGroupIds.forEach((groupId) => {
        const groupIndex =
          groupId !== null && sensor.location?.groupIds
            ? sensor.location.groupIds.indexOf(groupId)
            : -1;
        const groupName =
          groupId !== null
            ? ((groupIndex >= 0 ? sensor.location?.groupNames?.[groupIndex] : null) ||
                sensor.location?.groupName1 ||
                sensor.location?.groupName2 ||
                `Groupe ${groupId}`)
            : 'Sans groupe';

        let groupNode = siteNode.groups.find((g) => g.groupId === groupId);

        if (!groupNode) {
          groupNode = {
            groupId,
            groupName,
            sensors: [],
            stats: { total: 0, ok: 0, warning: 0, critical: 0, inactive: 0 },
          };
          siteNode.groups.push(groupNode);
        }

        groupNode.sensors.push(sensor);

        // Mettre à jour stats groupe
        groupNode.stats.total++;
        if (!sensor.isActive) {
          groupNode.stats.inactive++;
        } else if (sensor.status === 'critical') {
          groupNode.stats.critical++;
        } else if (sensor.status === 'warning') {
          groupNode.stats.warning++;
        } else {
          groupNode.stats.ok++;
        }
      });

      // Mettre à jour stats site
      siteNode.stats.total++;
      if (!sensor.isActive) {
        siteNode.stats.inactive++;
      } else if (sensor.status === 'critical') {
        siteNode.stats.critical++;
      } else if (sensor.status === 'warning') {
        siteNode.stats.warning++;
      } else {
        siteNode.stats.ok++;
      }
    });

    return Array.from(sitesMap.values()).sort((a, b) => a.siteName.localeCompare(b.siteName));
  }, [sensors]);

  if (tree.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Aucune sonde disponible
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {tree.map((site) => (
          <AccordionItem
            key={site.siteId}
            value={`site-${site.siteId}`}
            className="border rounded-lg overflow-hidden dark:border-gray-800"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 dark:hover:bg-gray-900/50">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{site.siteName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site.stats.total} sonde{site.stats.total > 1 ? 's' : ''}
                      {/* ✅ Afficher le nombre d'alarmes si présent */}
                      {(site.stats.critical > 0 || site.stats.warning > 0) && (
                        <> ({site.stats.critical + site.stats.warning} alarme{site.stats.critical + site.stats.warning > 1 ? 's' : ''})</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {site.stats.critical > 0 && (
                    <Badge variant="destructive" className="bg-red-600">
                      {site.stats.critical} critique{site.stats.critical > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {site.stats.warning > 0 && (
                    <Badge className="bg-yellow-500 text-white">
                      {site.stats.warning} attention
                    </Badge>
                  )}
                  {site.stats.ok > 0 && (
                    <Badge className="bg-green-600">
                      {site.stats.ok} OK
                    </Badge>
                  )}
                  {site.stats.inactive > 0 && (
                    <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                      {site.stats.inactive} inactif
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-0">
              <div className="space-y-2 pl-4 pr-4 pb-4">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {site.groups.map((group, idx) => (
                    <AccordionItem
                      key={`${site.siteId}-group-${group.groupId || idx}`}
                      value={`group-${site.siteId}-${group.groupId || idx}`}
                      className="border rounded-lg overflow-hidden dark:border-gray-700"
                    >
                      <AccordionTrigger className="px-3 py-2 hover:bg-muted/30 dark:hover:bg-gray-800/50">
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-2 flex-1 text-left">
                            <span className="font-medium text-sm">{group.groupName}</span>
                            <span className="text-xs text-muted-foreground">
                              {group.stats.total} sonde{group.stats.total > 1 ? 's' : ''}
                              {/* ✅ Afficher le nombre d'alarmes si présent */}
                              {(group.stats.critical > 0 || group.stats.warning > 0) && (
                                <> ({group.stats.critical + group.stats.warning} alarme{group.stats.critical + group.stats.warning > 1 ? 's' : ''})</>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {group.stats.critical > 0 && (
                              <Badge variant="destructive" className="bg-red-600 text-xs px-2 py-0">
                                {group.stats.critical}
                              </Badge>
                            )}
                            {group.stats.warning > 0 && (
                              <Badge className="bg-yellow-500 text-white text-xs px-2 py-0">
                                {group.stats.warning}
                              </Badge>
                            )}
                            {group.stats.ok > 0 && (
                              <Badge className="bg-green-600 text-xs px-2 py-0">
                                {group.stats.ok}
                              </Badge>
                            )}
                            {group.stats.inactive > 0 && (
                              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0">
                                {group.stats.inactive}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pt-0">
                        <div className="space-y-2 pl-3 pr-3 pb-3">
                          {group.sensors.map((sensor) => {
                            const colors = getStatusColor(
                              sensor.status,
                              sensor.isActive
                            );
                            return (
                              <div
                                key={sensor.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${colors.bg} dark:border-gray-700`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`${colors.text}`}>
                                    {colors.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${colors.text}`}>
                                      {sensor.name}
                                    </p>
                                    {sensor.currentValue !== null && (
                                      <p className="text-xs text-muted-foreground">
                                        {sensor.currentValue.toFixed(1)}
                                        {sensor.unit}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {getStatusBadge(sensor.status, sensor.isActive)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
