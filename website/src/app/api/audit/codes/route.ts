import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/audit/codes
 * Récupère la liste de tous les codes d'audit disponibles
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: { CodeJournal: "asc" },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Get audit codes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit codes" },
      { status: 500 }
    );
  }
}
