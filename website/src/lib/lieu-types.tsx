'use client';

import { Droplets, Flame, Thermometer, ThermometerSnowflake, Layers } from 'lucide-react';
import type { ReactNode } from 'react';

export type LieuTypeValue = 'bain_marie' | 'etuve' | 'ambiance' | 'frigo_congel' | 'autre' | null | string;

export interface TypeIconInfo {
  icon: ReactNode;
  label: string;
}

export function getTypeIcon(type: LieuTypeValue, iconSize: string = 'w-4 h-4'): TypeIconInfo {
  const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : type;

  switch (normalizedType) {
    case 'bain_marie':
      return {
        icon: <Droplets className={iconSize} />,
        label: 'Bain Marie',
      };
    case 'etuve':
      return {
        icon: <Flame className={iconSize} />,
        label: 'Etuve',
      };
    case 'ambiance':
      return {
        icon: <Thermometer className={iconSize} />,
        label: 'Ambiance',
      };
    case 'frigo_congel':
      return {
        icon: <ThermometerSnowflake className={iconSize} />,
        label: 'Frigo/Congel',
      };
    case 'autre':
      return {
        icon: <Layers className={iconSize} />,
        label: 'Autre',
      };
    default:
      return {
        icon: null,
        label: '-',
      };
  }
}
