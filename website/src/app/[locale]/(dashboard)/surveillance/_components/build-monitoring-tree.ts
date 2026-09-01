import type { SensorWithLocation } from "@/lib/api";
import type { TreeNode, TreeStats } from "./monitoring-tree-types";

type TreeLabels = {
  noGroup: string;
  noSite: string;
};

function emptyStats(): TreeStats {
  return { total: 0, ok: 0, warning: 0, ended: 0, critical: 0, inactive: 0 };
}

function bumpStats(stats: TreeStats, sensor: SensorWithLocation) {
  stats.total++;
  if (!sensor.isActive) {
    stats.inactive++;
  } else if (sensor.status === "critical") {
    stats.critical++;
  } else if (sensor.status === "warning") {
    stats.warning++;
  } else if (sensor.status === "ended") {
    stats.ended++;
  } else {
    stats.ok++;
  }
}

function getGroupNameMap(sensor: SensorWithLocation) {
  const ids = sensor.location?.groupIds ?? [];
  const names = sensor.location?.groupNames ?? [];

  const map = new Map<number, string>();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const name = names[i];
    if (typeof id === "number" && name) map.set(id, name);
  }
  return map;
}

function resolveGroupName(
  sensor: SensorWithLocation,
  groupId: number | null,
  nameById: Map<number, string>,
  labels: TreeLabels,
) {
  if (groupId === null) return labels.noGroup;

  const name = nameById.get(groupId);
  if (name) return name;

  if (sensor.location?.groupId1 === groupId && sensor.location?.groupName1) return sensor.location.groupName1;
  if (sensor.location?.groupId2 === groupId && sensor.location?.groupName2) return sensor.location.groupName2;

  return `Groupe ${groupId}`;
}

function compareLabels(a: string, b: string) {
  return a.localeCompare(b, "fr", { sensitivity: "base" });
}

export function buildSurveillanceTree(
  sensors: SensorWithLocation[],
  labels: TreeLabels = { noGroup: "Sans groupe", noSite: "Sans site" },
) {
  const sitesMap = new Map<number, TreeNode>();

  sensors.forEach((sensor) => {
    const siteId = sensor.location?.siteId || 0;
    const siteName = sensor.location?.site?.trim() || (siteId ? `Site ${siteId}` : labels.noSite);
    const groupNameMap = getGroupNameMap(sensor);

    const groupIds =
      sensor.location?.groupIds && sensor.location.groupIds.length > 0
        ? sensor.location.groupIds
        : [sensor.location?.groupId1 ?? null, sensor.location?.groupId2 ?? null].filter(
            (id): id is number => typeof id === "number" && !Number.isNaN(id),
          );

    if (!sitesMap.has(siteId)) {
      sitesMap.set(siteId, {
        siteId,
        siteName,
        groups: [],
        stats: emptyStats(),
      });
    }

    const siteNode = sitesMap.get(siteId)!;
    const effectiveGroupIds = groupIds.length > 0 ? groupIds : [null];

    effectiveGroupIds.forEach((groupId) => {
      const groupName = resolveGroupName(sensor, groupId, groupNameMap, labels);
      let groupNode = siteNode.groups.find((g) => g.groupId === groupId);

      if (!groupNode) {
        groupNode = {
          groupId,
          groupName,
          sensors: [],
          stats: emptyStats(),
        };
        siteNode.groups.push(groupNode);
      }

      groupNode.sensors.push(sensor);
      bumpStats(groupNode.stats, sensor);
    });

    bumpStats(siteNode.stats, sensor);
  });

  const tree = Array.from(sitesMap.values());
  tree.forEach((site) => {
    site.groups.sort((a, b) => {
      if (a.groupName === labels.noGroup && b.groupName !== labels.noGroup) return 1;
      if (b.groupName === labels.noGroup && a.groupName !== labels.noGroup) return -1;
      return compareLabels(a.groupName, b.groupName);
    });
  });

  tree.sort((a, b) => {
    if (a.siteName === labels.noSite && b.siteName !== labels.noSite) return 1;
    if (b.siteName === labels.noSite && a.siteName !== labels.noSite) return -1;
    return compareLabels(a.siteName, b.siteName);
  });

  return tree;
}
