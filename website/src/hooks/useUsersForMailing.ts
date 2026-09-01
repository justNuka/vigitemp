import { useQuery } from "@tanstack/react-query";
import { getJson, isUnauthorizedError } from "@/lib/http";

export type MailingUser = {
  id: number;
  username: string;
  displayName: string;
  email?: string | null;
};

async function fetchMailingUsers(): Promise<MailingUser[]> {
  return getJson<MailingUser[]>("/api/utilisateurs");
}

export function useUsersForMailing(enabled = true) {
  return useQuery({
    queryKey: ["mailing-users"],
    queryFn: fetchMailingUsers,
    enabled,
    refetchInterval: (query) => (isUnauthorizedError(query.state.error) ? false : 60000),
  });
}
