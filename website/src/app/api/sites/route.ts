import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";

const createSiteSchema = z.object({
  Code_Site: z.string().min(1, "Code site requis").max(20),
  Libelle_Site: z.string().min(1, "Libellé site requis").max(50),
  Commentaire: z.string().max(200).nullable().optional(),
});

const updateSiteSchema = z.object({
  Libelle_Site: z.string().min(1, "Libellé site requis").max(50),
  Commentaire: z.string().max(200).nullable().optional(),
});

/**
 * GET /api/sites
 * Récupère tous les sites (format complet pour la table admin, simplifié pour les sélects)
 */
export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format"); // "admin" ou "simple" (default)

    const sites = await prisma.t_site.findMany({
      where: { Est_Archive: false },
      orderBy: { Libelle_Site: "asc" },
    });

    if (format === "admin") {
      return NextResponse.json(sites);
    }

    // Format simplifié pour les sélects
    const formattedSites = sites.map((site) => ({
      id: site.Id_Site,
      name:
        site.Code_Site && site.Libelle_Site
          ? `${site.Code_Site} - ${site.Libelle_Site}`
          : site.Code_Site || site.Libelle_Site || "Sans nom",
    }));

    return NextResponse.json(formattedSites);
  } catch (error) {
    console.error("[GET /api/sites]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sites" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/sites
 * Crée un nouveau site
 */
export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createSiteSchema.parse(body);

    const site = await prisma.t_site.create({
      data: {
        Code_Site: validated.Code_Site,
        Libelle_Site: validated.Libelle_Site,
        Commentaire: validated.Commentaire || null,
        Est_Archive: false,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[POST /api/sites]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du site" },
      { status: 500 }
    );
  }
});
