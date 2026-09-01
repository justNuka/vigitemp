import type { SensorWithLocation } from "@/lib/api";

export interface TreeNode {
  siteId: number;
  siteName: string;
  groups: {
    groupId: number | null;
    groupName: string;
    sensors: SensorWithLocation[];
    stats: TreeStats;
  }[];
  stats: TreeStats;
}

export interface TreeStats {
  total: number;
  ok: number;
  warning: number;
  ended: number;
  critical: number;
  inactive: number;
}

