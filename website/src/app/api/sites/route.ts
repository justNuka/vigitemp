import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sites
 * Récupère tous les sites non archivés
 */
export async function GET() {
  try {
    const sites = await prisma.t_site.findMany({
      where: {
        Est_Archive: false,
      },
      select: {
        Id_Site: true,
        Code_Site: true,
        Libelle_Site: true,
      },
      orderBy: [
        { Code_Site: "asc" },
        { Libelle_Site: "asc" },
      ],
    });

    // Mapper vers le format attendu par le front
    const formattedSites = sites.map((site) => ({
      id: site.Id_Site,
      name: site.Code_Site && site.Libelle_Site
        ? `${site.Code_Site} - ${site.Libelle_Site}`
        : site.Code_Site || site.Libelle_Site || "Sans nom",
    }));

    return NextResponse.json(formattedSites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sites" },
      { status: 500 }
    );
  }
}
