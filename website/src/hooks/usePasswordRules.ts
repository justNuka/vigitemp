import { useQuery } from "@tanstack/react-query";

export interface PasswordRules {
  min_length: number;
  min_uppercase: number;
  min_lowercase: number;
  min_numbers: number;
  min_special: number;
  history_count: number;
}

/**
 * Hook pour récupérer les règles de validation des mots de passe
 * Utilise React Query pour le caching
 */
export function usePasswordRules() {
  return useQuery<PasswordRules>({
    queryKey: ["password-rules"],
    queryFn: async () => {
      const response = await fetch("/api/settings/password-rules");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des règles");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
