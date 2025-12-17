/**
 * Performance diagnosis script for ts_mesure queries
 * Run with: npx tsx scripts/diagnose-mesure-performance.ts
 */

import { prismaMesure } from "@/lib/prisma";

async function diagnosePerformance() {
  console.log("📊 Diagnosing ts_mesure query performance...\n");

  // Test 1: Count total records
  console.log("1️⃣ Total records in tm_mesures:");
  const startCount = Date.now();
  const totalCount = await prismaMesure.tm_mesures.count();
  console.log(`   ${totalCount} records (took ${Date.now() - startCount}ms)\n`);

  // Test 2: Query a single location with 125 measurements
  const testIdLieu = 1;
  console.log(`2️⃣ Query 125 latest measurements for idLieu=${testIdLieu}:`);
  
  const startQuery = Date.now();
  const measurements = await prismaMesure.tm_mesures.findMany({
    where: { Id_Lieu: testIdLieu, Valeur: { not: null } },
    take: 125,
    orderBy: { Date_Heure_Mesure: "desc" },
    select: {
      Id_Mesure: true,
      Date_Heure_Mesure: true,
      Valeur: true,
      Unite: true,
      Consigne: true,
      Consigne_Sup: true,
      Consigne_Inf: true,
      Sonde_Numero_Serie: true,
      Frequence: true,
      Est_Etat_Alarme: true,
    },
  });
  const queryTime = Date.now() - startQuery;
  console.log(`   Retrieved ${measurements.length} measurements (took ${queryTime}ms)\n`);

  // Test 3: Parallel queries (simulate dashboard load)
  console.log("3️⃣ Simulating 4 parallel queries (like MonitoringCards):");
  const parallelStart = Date.now();
  
  const promises = [1, 2, 3, 4].map(idLieu =>
    prismaMesure.tm_mesures.findMany({
      where: { Id_Lieu: idLieu, Valeur: { not: null } },
      take: 125,
      orderBy: { Date_Heure_Mesure: "desc" },
      select: { Id_Mesure: true, Date_Heure_Mesure: true, Valeur: true },
    })
  );

  await Promise.all(promises);
  const parallelTime = Date.now() - parallelStart;
  console.log(`   4 parallel queries took ${parallelTime}ms\n`);

  // Test 4: Check index usage (simplified - would need actual query plan)
  console.log("4️⃣ Database connection info:");
  console.log(`   Using prismaMesure connection from ${process.env.DATABASE_URL_MESURE?.split("@")[1] || "config"}\n`);

  // Recommendations
  console.log("📋 Recommendations:");
  if (queryTime > 1000) {
    console.log("   ⚠️ Single query takes >1s - check database indexes and connection pool");
  } else if (queryTime > 500) {
    console.log("   ⚡ Single query takes >500ms - consider query optimization");
  } else {
    console.log("   ✅ Single query performance is acceptable");
  }

  if (parallelTime > queryTime * 3) {
    console.log("   ⚠️ Parallel queries show significant slowdown - check connection pool size");
  } else {
    console.log("   ✅ Parallel query performance is acceptable");
  }

  console.log("\n✨ Diagnosis complete");
}

diagnosePerformance().catch(console.error);
