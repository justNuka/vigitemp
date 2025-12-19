import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";

const updateSiteSchema = z.object({
  Libelle_Site: z.string().min(1, "Libellé site requis").max(50).optional(),
  Commentaire: z.string().max(200).nullable().optional(),
  Est_Archive: z.boolean().optional(),
});

export const PATCH = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID site requis" }, { status: 400 });
    }

    const body = await req.json();
    const validated = updateSiteSchema.parse(body);

    const site = await prisma.t_site.update({
      where: { Id_Site: parseInt(id) },
      data: validated,
    });

    return NextResponse.json(site);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[PATCH /api/sites/[id]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du site" },
      { status: 500 }
    );
  }
});
