'use client';

import { useEffect, useState } from 'react';
import MonitoringCard from "@/components/monitoring-card";
import { EmptyState } from "@/components/empty-state";
import type { SensorWithLocation } from "@/lib/api";
import { Activity, Building2, Users, ChevronDown } from "lucide-react";

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
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialiser depuis localStorage au montage
  useEffect(() => {
    try {
      const savedSites = localStorage.getItem('surveillance-expanded-sites');
      const savedGroups = localStorage.getItem('surveillance-expanded-groups');
      
      if (savedSites) setExpandedSites(new Set(JSON.parse(savedSites)));
      if (savedGroups) setExpandedGroups(new Set(JSON.parse(savedGroups)));
    } catch (e) {
      console.error('Erreur lors de la lecture du localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Persister les changements en localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('surveillance-expanded-sites', JSON.stringify(Array.from(expandedSites)));
      localStorage.setItem('surveillance-expanded-groups', JSON.stringify(Array.from(expandedGroups)));
    }
  }, [expandedSites, expandedGroups, isHydrated]);

  const toggleSite = (siteId: string) => {
    setExpandedSites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };
  if (sensors.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Aucun lieu de surveillance"
          description="Aucune donnée disponible pour le moment."
          icon={Activity}
        />
      </div>
    );
  }

  // Grouper par Site → Groupe
  type GroupStructure = {
    [siteId: string]: {
      siteName: string;
      groups: {
        [groupName: string]: SensorWithLocation[];
      };
    };
  };

  const grouped: GroupStructure = sensors.reduce((acc, sensor) => {
    const siteId = String(sensor.location.siteId || 'no-site');
    const siteName = sensor.location.site || `Site ${siteId}`;
    const groupName = sensor.location.groupName1 || 'Sans groupe';

    if (!acc[siteId]) {
      acc[siteId] = {
        siteName,
        groups: {}
      };
    }

    if (!acc[siteId].groups[groupName]) {
      acc[siteId].groups[groupName] = [];
    }

    acc[siteId].groups[groupName].push(sensor);
    return acc;
  }, {} as GroupStructure);

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Boucle sur les sites */}
      {Object.entries(grouped).map(([siteId, { siteName, groups }]) => {
        const isSiteExpanded = expandedSites.has(siteId);
        
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
              <span className="ml-auto text-sm text-gray-500">
                {(() => {
                  const allSensors = Object.values(groups).flat();
                  const alarmCount = allSensors.filter(s => s.status !== 'ok').length;
                  return alarmCount > 0 
                    ? `${allSensors.length} sonde(s) (${alarmCount} alarme(s))`
                    : `${allSensors.length} sonde(s)`;
                })()}
              </span>
            </button>

            {/* Contenu du site - conditionnel */}
            {isSiteExpanded && (
              <div className="space-y-4 animate-fade-in">
                {/* Boucle sur les groupes */}
                {Object.entries(groups).map(([groupName, groupSensors]) => {
                  const groupKey = `${siteId}-${groupName}`;
                  const isGroupExpanded = expandedGroups.has(groupKey);

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
                        <span className="ml-auto text-xs text-gray-500">
                          {(() => {
                            const alarmCount = groupSensors.filter(s => s.status !== 'ok').length;
                            return alarmCount > 0
                              ? `${groupSensors.length} sonde(s) (${alarmCount} alarme(s))`
                              : `${groupSensors.length} sonde(s)`;
                          })()}
                        </span>
                      </button>

                      {/* Grille des sondes du groupe - conditionnel */}
                      {isGroupExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 animate-fade-in">
                          {groupSensors.map((sensor) => (
                            <MonitoringCard
                              key={sensor.id}
                              idLieu={parseInt(sensor.id)}
                              nomLieu={sensor.name}
                              sondeNumeroSerie={(sensor as any).SondeNumeroSerie}
                              lieuEtat={(sensor as any).Lieu_Etat}
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
