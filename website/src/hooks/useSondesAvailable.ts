'use client';

import { useQuery } from '@tanstack/react-query';

export interface SondeAvailable {
  Id_Sonde: number;
  Sonde_Numero_Serie: string;
  Etat_Sonde: string;
  Lieu: string | null;
}

export function useSondesAvailable() {
  return useQuery({
    queryKey: ['sondes-available'],
    queryFn: async () => {
      const res = await fetch('/api/sondes');
      if (!res.ok) throw new Error('Erreur récupération sondes');
      const data = await res.json();
      // Retourner uniquement les sondes non affectées (Lieu === null)
      return data.filter((sonde: any) => !sonde.Lieu) as SondeAvailable[];
    },
    refetchInterval: 60000,
  });
}
