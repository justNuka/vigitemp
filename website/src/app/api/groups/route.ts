import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/groups
 * Récupère tous les groupes non archivés
 */
export async function GET() {
  try {
    const groups = await prisma.t_groupe.findMany({
      where: {
        Est_Archive: false,
      },
      select: {
        Id_Groupe: true,
        Nom_Groupe: true,
      },
      orderBy: {
        Nom_Groupe: "asc",
      },
    });

    // Mapper vers le format attendu par le front
    const formattedGroups = groups.map((group) => ({
      id: group.Id_Groupe,
      name: group.Nom_Groupe || "Sans nom",
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des groupes" },
      { status: 500 }
    );
  }
}
