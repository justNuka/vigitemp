import { useQuery } from "@tanstack/react-query";

export interface Calibrage {
  Id_Calibrage: number;
  Date_Heure_Calibrage: Date | null;
  Sonde_Numero_Serie: string | null;
  Operateur: string | null;
  Unite: string | null;
  Nb_Decimale: number | null;
}

async function fetchCalibrage(serieNum: string): Promise<Calibrage[]> {
  const response = await fetch(`/api/sondes/calibrages?serie=${encodeURIComponent(serieNum)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch calibrages");
  }
  return response.json();
}

export function useCalibrages(serieNum: string | null) {
  return useQuery({
    queryKey: ["calibrages", serieNum],
    queryFn: () => fetchCalibrage(serieNum!),
    enabled: !!serieNum,
    refetchInterval: 60000,
  });
}
