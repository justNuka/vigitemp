import { useQuery } from "@tanstack/react-query";
import { type Site } from "@/lib/api";

async function fetchSites(): Promise<Site[]> {
  const response = await fetch("/api/sites");
  if (!response.ok) throw new Error("Failed to fetch sites");
  return response.json();
}

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  });
}
