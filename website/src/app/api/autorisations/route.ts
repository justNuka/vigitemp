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
        Code_Autorisation: "asc",
      },
    });

    const formatted = authorizations.map((auth) => ({
      id: auth.Id_Autorisation,
      code: auth.Code_Autorisation,
      label: auth.Libelle_Autorisation,
      description: auth.Commentaire,
      fenAdmin: auth.A_Acces_Admin,
      fenMetrologie: auth.A_Acces_Metrologie,
      fenSurveillance: auth.A_Acces_Surveillance,
      fenVigiLog: auth.A_Acces_VigiLog,
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
