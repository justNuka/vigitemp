import { getJson, postJson, deleteJson } from "@/lib/http";

type UserId = string;

export async function addUserSites(userId: UserId, siteIds: number[]) {
  for (const siteId of siteIds) {
    await postJson(`/api/utilisateurs/${userId}/sites`, { siteId });
  }
}

export async function addUserGroups(userId: UserId, groupIds: number[]) {
  for (const groupId of groupIds) {
    await postJson(`/api/utilisateurs/${userId}/groupes`, { groupId });
  }
}

export async function syncUserSites(userId: UserId, desiredSiteIds: number[]) {
  const currentSites = await getJson<any[]>(`/api/utilisateurs/${userId}/sites`);
  const currentSiteIds = currentSites
    .map((s: any) => s?.Id_Site)
    .filter((id: any) => typeof id === "number") as number[];

  const toRemove = currentSiteIds.filter((id) => !desiredSiteIds.includes(id));
  const toAdd = desiredSiteIds.filter((id) => !currentSiteIds.includes(id));

  for (const siteId of toRemove) {
    await deleteJson(`/api/utilisateurs/${userId}/sites/${siteId}`);
  }
  for (const siteId of toAdd) {
    await postJson(`/api/utilisateurs/${userId}/sites`, { siteId });
  }
}

export async function syncUserGroups(userId: UserId, desiredGroupIds: number[]) {
  const currentGroups = await getJson<any[]>(`/api/utilisateurs/${userId}/groupes`);
  const currentGroupIds = currentGroups
    .map((g: any) => g?.Id_Groupe)
    .filter((id: any) => typeof id === "number") as number[];

  const toRemove = currentGroupIds.filter((id) => !desiredGroupIds.includes(id));
  const toAdd = desiredGroupIds.filter((id) => !currentGroupIds.includes(id));

  for (const groupId of toRemove) {
    await deleteJson(`/api/utilisateurs/${userId}/groupes/${groupId}`);
  }
  for (const groupId of toAdd) {
    await postJson(`/api/utilisateurs/${userId}/groupes`, { groupId });
  }
}
