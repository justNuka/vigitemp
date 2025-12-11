/**
 * Intelligent measurement cache that keeps measurements in memory
 * and only fetches new ones as they arrive (every ~15 minutes)
 * 
 * This dramatically reduces database load when you have 764+ sensors
 * Instead of 764*125 = 95,500 DB queries per refresh,
 * you only fetch the latest measurement per sensor
 */

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
  measurements: MeasureData[];
  lastFetchTime: number;
  lastMeasureTimestamp: string; // To detect new measurements
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - match sensor measurement frequency
const MAX_MEASUREMENTS = 125; // Keep only 125 latest measurements per sensor

// Global cache store
const measurementCache = new Map<string, CacheEntry>();

/**
 * Get cached measurements for a location
 */
export function getCachedMeasurements(idLieu: number): MeasureData[] | null {
  const cacheKey = `measurements-${idLieu}`;
  const cached = measurementCache.get(cacheKey);
  
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.lastFetchTime > CACHE_DURATION) {
    // Cache expired, remove it
    measurementCache.delete(cacheKey);
    return null;
  }
  
  return cached.measurements;
}

/**
 * Store measurements in cache
 * If cache exists, merges with new measurements and keeps latest 125
 */
export function setCachedMeasurements(idLieu: number, newMeasurements: MeasureData[]) {
  const cacheKey = `measurements-${idLieu}`;
  const cached = measurementCache.get(cacheKey);
  
  // If we have cached data, merge them intelligently
  if (cached && cached.measurements.length > 0) {
    // Combine old and new measurements
    const combined = [...cached.measurements, ...newMeasurements];
    
    // Remove duplicates (same id)
    const uniqueMap = new Map<string, MeasureData>();
    combined.forEach(m => {
      uniqueMap.set(m.id, m);
    });
    
    // Keep only the latest 125, sorted by date (newest first after reversal)
    const merged = Array.from(uniqueMap.values())
      .sort((a, b) => {
        // Parse dates like "10/12/2025 14:30" to compare them
        const dateA = new Date(a.DateHeureMesure.split(' ')[0].split('/').reverse().join('-') + ' ' + a.DateHeureMesure.split(' ')[1]);
        const dateB = new Date(b.DateHeureMesure.split(' ')[0].split('/').reverse().join('-') + ' ' + b.DateHeureMesure.split(' ')[1]);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, MAX_MEASUREMENTS);
    
    const lastMeasureTimestamp = newMeasurements.length > 0 
      ? newMeasurements[0].DateHeureMesure 
      : (merged.length > 0 ? merged[0].DateHeureMesure : '');
    
    measurementCache.set(cacheKey, {
      measurements: merged,
      lastFetchTime: Date.now(),
      lastMeasureTimestamp,
    });
  } else {
    // No cache yet, just store the measurements
    const lastMeasureTimestamp = newMeasurements.length > 0 
      ? newMeasurements[0].DateHeureMesure 
      : '';
    
    measurementCache.set(cacheKey, {
      measurements: newMeasurements.slice(0, MAX_MEASUREMENTS),
      lastFetchTime: Date.now(),
      lastMeasureTimestamp,
    });
  }
}

/**
 * Check if cache needs refresh (new measurement available)
 * Used to determine if we should fetch from DB or just use cache
 */
export function shouldRefreshCache(idLieu: number, lastKnownTimestamp?: string): boolean {
  const cacheKey = `measurements-${idLieu}`;
  const cached = measurementCache.get(cacheKey);
  
  if (!cached) return true; // No cache, fetch from DB
  
  // If we know the last measurement timestamp from DB metadata,
  // compare it with cached timestamp to see if new data is available
  if (lastKnownTimestamp && lastKnownTimestamp !== cached.lastMeasureTimestamp) {
    return true; // New measurement available
  }
  
  // If cache is still fresh, no need to refresh
  if (Date.now() - cached.lastFetchTime < CACHE_DURATION) {
    return false;
  }
  
  return true; // Cache expired, refresh
}

/**
 * Clear cache for a specific location (useful after data updates)
 */
export function clearLocationCache(idLieu: number) {
  const cacheKey = `measurements-${idLieu}`;
  measurementCache.delete(cacheKey);
}

/**
 * Clear all measurement caches (useful on app restart)
 */
export function clearAllMeasurementCaches() {
  measurementCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  let totalMeasurements = 0;
  const locations: Array<{
    idLieu: number;
    measurements: number;
    age: number;
  }> = [];
  
  measurementCache.forEach((entry, key) => {
    const idLieu = parseInt(key.split('-')[1]);
    totalMeasurements += entry.measurements.length;
    locations.push({
      idLieu,
      measurements: entry.measurements.length,
      age: Date.now() - entry.lastFetchTime,
    });
  });
  
  return {
    cachedLocations: measurementCache.size,
    totalMeasurements,
    locations,
    memoryEstimate: `~${(totalMeasurements * 0.5).toFixed(0)}KB`, // Rough estimate
  };
}
