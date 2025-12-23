import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prismaMesure } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: {
        Code_Journal: "asc",
      },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Error fetching journal codes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des codes de journal" },
      { status: 500 }
    );
  }
});
