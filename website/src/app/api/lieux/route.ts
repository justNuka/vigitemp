import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";

const createLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(20),
  Lieu_Etat: z.string().max(100).nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  Id_Groupe1: z.number().nullable().optional(),
  Id_Groupe2: z.number().nullable().optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Frequence: z.number().nullable().optional(),
  // Consignes Sup
  Consigne_Sup: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().nullable().optional(),
  // Consignes Inf
  Consigne_Inf: z.number().nullable().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().nullable().optional(),
});

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  try {
    const lieux = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      include: {
        t_groupe1: { select: { Nom_Groupe: true } },
        t_groupe2: { select: { Nom_Groupe: true } },
        t_site: { select: { Libelle_Site: true } },
        t_sonde: { select: { Sonde_Numero_Serie: true } },
      },
      orderBy: { Nom_Lieu: "asc" },
    });

    // Convert BigInt to string for JSON serialization
    const serialized = JSON.parse(
      JSON.stringify(lieux, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("[GET /api/lieux]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des lieux" },
      { status: 500 }
    );
  }
});

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createLieuSchema.parse(body);

    const lieu = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: validated.Nom_Lieu,
        Lieu_Etat: validated.Lieu_Etat,
        Id_Site: validated.Id_Site,
        Id_Groupe1: validated.Id_Groupe1,
        Id_Groupe2: validated.Id_Groupe2,
        Sonde_Numero_Serie: validated.Sonde_Numero_Serie,
        Consigne: validated.Consigne,
        Frequence: validated.Frequence,
        Consigne_Sup: validated.Consigne_Sup,
        Est_Consigne_Sup_Active: validated.Est_Consigne_Sup_Active ?? false,
        Consigne_Sup_Pre_Alarme: validated.Consigne_Sup_Pre_Alarme,
        Est_Consigne_Sup_Pre_Alarme_Active:
          validated.Est_Consigne_Sup_Pre_Alarme_Active ?? false,
        Retard_Alarme_Haut: validated.Retard_Alarme_Haut,
        Consigne_Inf: validated.Consigne_Inf,
        Est_Consigne_Inf_Active: validated.Est_Consigne_Inf_Active ?? false,
        Consigne_Inf_Pre_Alarme: validated.Consigne_Inf_Pre_Alarme,
        Est_Consigne_Inf_Pre_Alarme_Active:
          validated.Est_Consigne_Inf_Pre_Alarme_Active ?? false,
        Retard_Alarme_Bas: validated.Retard_Alarme_Bas,
        Est_Archive: false,
      },
    });

    return NextResponse.json(lieu, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[POST /api/lieux]", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du lieu" },
      { status: 500 }
    );
  }
});
