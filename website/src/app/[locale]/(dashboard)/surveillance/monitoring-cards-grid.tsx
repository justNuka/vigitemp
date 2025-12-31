'use client';

import MonitoringCard from "@/components/monitoring-card";
import type { SensorWithLocation } from "@/lib/api";
import { Building2, Users, ChevronDown } from "lucide-react";

import { groupSensorsBySiteAndGroup } from "./_helpers/group-sensors";
import { usePersistentStringSet } from "./_hooks/use-persistent-string-set";
import { sortSensorsByStatus } from "./_helpers/monitoring-derived";
import { SurveillanceEmptyState } from "./_components/monitoring-empty-state";
import { countStatus } from "@/lib/surveillance-status";
import { SurveillanceTreeStatsBadges } from "./_components/monitoring-tree-stats-badges";
import { formatAlarmes, formatGroupes, formatSondes } from "./_helpers/monitoring-labels";

/**
 * MonitoringCardsGrid - Groupée par Site → Groupe avec dépliage/repliage
 * 
 * Structure d'affichage:
 * - Site 1 [déplié/replié]
 *   - Groupe 1 [déplié/replié]
 *     [Cartes des sondes]
 *   - Groupe 2
 *     [Cartes des sondes]
 * - Site 2
 *   etc...
 * 
 * État persisté en localStorage pour persister les préférences utilisateur
 */
interface MonitoringCardsGridProps {
  sensors: SensorWithLocation[];
  onSurveillanceToggle?: (idLieu: number, newState: boolean) => void;
}

export function MonitoringCardsGrid({ 
  sensors,
  onSurveillanceToggle 
}: MonitoringCardsGridProps) {
  const { value: expandedSites, toggle: toggleSite } = usePersistentStringSet("surveillance-expanded-sites");
  const { value: expandedGroups, toggle: toggleGroup } = usePersistentStringSet("surveillance-expanded-groups");

  if (sensors.length === 0) {
    return <SurveillanceEmptyState title="Aucune sonde" />;
  }

  const grouped = groupSensorsBySiteAndGroup(sensors);

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Boucle sur les sites */}
      {grouped.map(({ siteId, siteName, sensorsCount, groups }) => {
        const isSiteExpanded = expandedSites.has(siteId);
        const siteSensors = groups.flatMap((g) => g.sensors);
        const siteStats = countStatus(siteSensors);
        const siteAlarmsCount = siteStats.critical + siteStats.warning;
        
        return (
          <div key={siteId} className="space-y-6">
            {/* Titre du site - cliquable */}
            <button
              onClick={() => toggleSite(siteId)}
              className="w-full flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 px-2 py-1 rounded transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isSiteExpanded ? 'rotate-0' : '-rotate-90'
                }`}
              />
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold">{siteName}</h2>
              <span className="ml-auto flex items-center gap-3 text-sm text-gray-500">
                <span>
                  {formatSondes(sensorsCount)} • {formatGroupes(groups.length)}
                  {siteAlarmsCount > 0 ? ` • ${formatAlarmes(siteAlarmsCount)}` : ""}
                </span>
                <SurveillanceTreeStatsBadges stats={siteStats} compact />
              </span>
            </button>

            {/* Contenu du site - conditionnel */}
            {isSiteExpanded && (
              <div className="space-y-4 animate-fade-in">
                {/* Boucle sur les groupes */}
                {groups.map(({ groupKey, groupName, sensors: groupSensors }) => {
                  const isGroupExpanded = expandedGroups.has(groupKey);
                  const sortedGroupSensors = sortSensorsByStatus(groupSensors);
                  const groupStats = countStatus(groupSensors);
                  const alarmsCount = groupStats.critical + groupStats.warning;

                  return (
                    <div key={groupKey} className="space-y-3">
                      {/* Titre du groupe - cliquable */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-900/50 rounded transition-colors"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isGroupExpanded ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                        <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-lg font-semibold">{groupName}</h3>
                        <span className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                          <span>
                            {formatSondes(groupSensors.length)}
                            {alarmsCount > 0 ? ` • ${formatAlarmes(alarmsCount)}` : ""}
                          </span>
                          <SurveillanceTreeStatsBadges stats={groupStats} compact />
                        </span>
                      </button>

                      {/* Grille des sondes du groupe - conditionnel */}
                      {isGroupExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 animate-fade-in">
                          {sortedGroupSensors.map((sensor) => (
                            <MonitoringCard
                              key={sensor.id}
                              idLieu={Number(sensor.id)}
                              nomLieu={sensor.name}
                              lieuType={sensor.lieuType || null}
                              siteName={siteName}
                              groupName={groupName}
                              onSurveillanceToggle={onSurveillanceToggle}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
