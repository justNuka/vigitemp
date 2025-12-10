import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/autorisations
 * Récupère la liste de toutes les autorisations disponibles
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get all authorizations
    const authorizations = await prisma.t_autorisation.findMany({
      orderBy: {
        CodeAutorisation: "asc",
      },
    });

    const formatted = authorizations.map((auth) => ({
      id: auth.IdAutorisation,
      code: auth.CodeAutorisation,
      label: auth.LibelleAutorisation,
      description: auth.Commentaire,
      fenAdmin: auth.fenAdmin,
      fenMetrologie: auth.fenMetrologie,
      fenSurveillance: auth.fenSurveillance,
      fenVigiLog: auth.fenVigiLog,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get authorizations error:", error);
    return NextResponse.json(
      { error: "Échec de récupération des autorisations" },
      { status: 500 }
    );
  }
}
