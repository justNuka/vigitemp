'use client';

import { Droplets, Flame, Thermometer, ThermometerSnowflake, Layers } from 'lucide-react';
import type { ReactNode } from 'react';

export type LieuTypeValue = 'bain_marie' | 'etuve' | 'ambiance' | 'frigo_congel' | 'autre' | null | string;

export interface TypeIconInfo {
  icon: ReactNode;
  label: string;
}

export function getTypeIcon(
  type: LieuTypeValue,
  iconSize: string = 'w-4 h-4',
  labels?: Partial<Record<Exclude<LieuTypeValue, null>, string>>
): TypeIconInfo {
  const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : type;
  const resolvedLabels = {
    bain_marie: labels?.bain_marie ?? 'Bain Marie',
    etuve: labels?.etuve ?? 'Etuve',
    ambiance: labels?.ambiance ?? 'Ambiance',
    frigo_congel: labels?.frigo_congel ?? 'Frigo/Congel',
    autre: labels?.autre ?? 'Autre',
  } as const;

  switch (normalizedType) {
    case 'bain_marie':
      return {
        icon: <Droplets className={iconSize} />,
        label: resolvedLabels.bain_marie,
      };
    case 'etuve':
      return {
        icon: <Flame className={iconSize} />,
        label: resolvedLabels.etuve,
      };
    case 'ambiance':
      return {
        icon: <Thermometer className={iconSize} />,
        label: resolvedLabels.ambiance,
      };
    case 'frigo_congel':
      return {
        icon: <ThermometerSnowflake className={iconSize} />,
        label: resolvedLabels.frigo_congel,
      };
    case 'autre':
      return {
        icon: <Layers className={iconSize} />,
        label: resolvedLabels.autre,
      };
    default:
      return {
        icon: null,
        label: '-',
      };
  }
}
