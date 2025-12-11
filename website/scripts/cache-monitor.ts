#!/usr/bin/env node

/**
 * Cache monitoring CLI
 * Check measurement cache status and statistics
 * 
 * Usage:
 *   npm run cache:stats     - Show cache statistics
 *   npm run cache:clear     - Clear all caches
 */

async function getCacheStats() {
  try {
    const response = await fetch('http://localhost:3000/api/cache/measurements');
    const data = await response.json();
    
    console.log('\n📊 Measurement Cache Statistics\n');
    console.log(`Cached Locations: ${data.cache.cachedLocations}`);
    console.log(`Total Measurements: ${data.cache.totalMeasurements}`);
    console.log(`Memory Estimate: ${data.cache.memoryEstimate}`);
    
    if (data.cache.locations.length > 0) {
      console.log('\n📍 Location Details:');
      console.log('─'.repeat(60));
      
      data.cache.locations
        .sort((a: any, b: any) => b.measurements - a.measurements)
        .slice(0, 10)
        .forEach((loc: any) => {
          const ageMin = Math.round(loc.age / 1000 / 60);
          console.log(`  ID ${loc.idLieu.toString().padEnd(4)} │ ${loc.measurements.toString().padEnd(3)} measurements │ Age: ${ageMin}min`);
        });
      
      if (data.cache.locations.length > 10) {
        console.log(`  ... and ${data.cache.locations.length - 10} more locations`);
      }
    }
    
    console.log('\n💡 Cache Info:');
    console.log('  • Duration: 15 minutes (matches sensor frequency)');
    console.log('  • Max per location: 125 measurements');
    console.log('  • Strategy: Smart merging (keeps old cache + adds new)');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Could not connect to cache API. Is the dev server running on port 3000?');
    process.exit(1);
  }
}

async function clearCache() {
  try {
    const response = await fetch('http://localhost:3000/api/cache/measurements', {
      method: 'DELETE'
    });
    const data = await response.json();
    console.log('\n✅ All measurement caches cleared\n');
  } catch (error) {
    console.error('❌ Could not clear cache. Is the dev server running on port 3000?');
    process.exit(1);
  }
}

const command = process.argv[2];

if (command === 'stats') {
  getCacheStats();
} else if (command === 'clear') {
  clearCache();
} else {
  console.log('Usage: npx tsx scripts/cache-monitor.ts <stats|clear>');
  console.log('  stats - Show cache statistics');
  console.log('  clear - Clear all caches');
}
