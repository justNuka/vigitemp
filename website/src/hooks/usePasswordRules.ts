import { useQuery } from "@tanstack/react-query"
import type { PasswordRules } from "@/lib/api"
import { getJson } from "@/lib/http"

/**
 * Hook pour récupérer les règles de validation des mots de passe.
 */
export function usePasswordRules() {
  return useQuery<PasswordRules>({
    queryKey: ["password-rules"],
    queryFn: async () => getJson<PasswordRules>("/api/parametres/password-rules"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
