import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface MeasureData {
  id: string;
  Valeur: number;
  Unite: string;
  DateHeureMesure: string;
  DateHeureMesureXaxis: string;
  Consigne: number | null;
  Consigne_Sup: number | null;
  Consigne_Inf: number | null;
  SondeNumeroSerie: string;
  Frequence: number;
  Etat_Alarme: number;
}

interface CacheEntry {
  data: MeasureData[];
  timestamp: number;
  promise?: Promise<MeasureData[]>;
}

const CACHE_DURATION = 60000; // 1 minute
const measurementCache = new Map<string, CacheEntry>();

/**
 * Hook to fetch measurements with built-in caching
 * Prevents multiple simultaneous requests for the same location
 */
export function useMeasurements(idLieu: number) {
  const [data, setData] = useState<MeasureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheKeyRef = useRef(`measurements-${idLieu}`);

  useEffect(() => {
    const cacheKey = cacheKeyRef.current;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if we have cached data
        const cached = measurementCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          // Use cached data
          setData(cached.data);
          setLoading(false);
          return;
        }

        // Check if a request is already in progress
        if (cached?.promise) {
          const result = await cached.promise;
          setData(result);
          setLoading(false);
          return;
        }

        // Fetch new data
        const promise = (async () => {
          const response = await axios.get(`/api/mesures/${idLieu}`, {
            params: { rowNumber: 125 }
          });
          return response.data as MeasureData[];
        })();

        // Store the promise to deduplicate requests
        measurementCache.set(cacheKey, {
          data: [],
          timestamp: Date.now(),
          promise,
        });

        const result = await promise;
        
        // Update cache with the result
        measurementCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch measurements'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [idLieu]);

  return { data, loading, error };
}
