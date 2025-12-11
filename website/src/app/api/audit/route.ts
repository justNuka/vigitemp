import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const codeFilter = searchParams.get("code");

    // Build where clause
    const whereClause = codeFilter 
      ? { CodeJournal: codeFilter }
      : {};

    // Get audit logs from time-series database
    const logs = await prismaMesure.ts_journal.findMany({
      where: whereClause,
      take: limit,
      orderBy: { DateHeureJournal: "desc" },
      select: {
        IdJournal: true,
        DateHeureJournal: true,
        CodeJournal: true,
        Commentaire: true,
        NomUtilisateur: true,
        IdLieu: true,
      },
    });

    const formatted = logs.map((log: any) => ({
      id: log.IdJournal,
      timestamp: log.DateHeureJournal?.toISOString() || new Date().toISOString(),
      userId: null,
      action: log.CodeJournal || "unknown",
      details: log.Commentaire || "",
      sensorId: log.IdLieu || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
