import { useQuery } from "@tanstack/react-query";

export interface Profile {
  id: number;
  name: string;
  description: string | null;
  mc2: boolean | null;
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

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profils");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return res.json() as Promise<Profile[]>;
    },
  });
}

export function useAuthorizations() {
  return useQuery({
    queryKey: ["authorizations"],
    queryFn: async () => {
      const res = await fetch("/api/autorisations");
      if (!res.ok) throw new Error("Failed to fetch authorizations");
      return res.json() as Promise<Authorization[]>;
    },
  });
}
