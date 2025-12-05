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
        Archive: false,
      },
      select: {
        IdSite: true,
        CodeSite: true,
        LibelleSite: true,
      },
      orderBy: [
        { CodeSite: "asc" },
        { LibelleSite: "asc" },
      ],
    });

    // Mapper vers le format attendu par le front
    const formattedSites = sites.map((site) => ({
      id: site.IdSite,
      name: site.CodeSite && site.LibelleSite
        ? `${site.CodeSite} - ${site.LibelleSite}`
        : site.CodeSite || site.LibelleSite || "Sans nom",
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
