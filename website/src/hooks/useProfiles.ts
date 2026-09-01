import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/http";

export interface Profile {
  id: number;
  name: string;
  description: string | null;
  mc2: boolean | null;
  estArchive?: boolean | null;
  userCount: number;
  authorizations: Authorization[];
}

export interface Authorization {
  id: number;
  code: string;
  label: string | null;
  description: string | null;
  fenAdmin: boolean | null;
  fenMetrologie: boolean | null;
  fenSurveillance: boolean | null;
  fenVigiLog: boolean | null;
}

export type ProfileArchiveStatus = "active" | "archived" | "all";

export function useProfiles(enabled: boolean = true, status: ProfileArchiveStatus = "active") {
  return useQuery({
    queryKey: ["profiles", status],
    queryFn: async () => {
      return getJson<Profile[]>(`/api/profils?status=${status}`);
    },
    enabled,
  });
}

export function useAuthorizations(enabled: boolean = true) {
  return useQuery({
    queryKey: ["authorizations"],
    queryFn: async () => {
      return getJson<Authorization[]>("/api/autorisations");
    },
    enabled,
  });
}
