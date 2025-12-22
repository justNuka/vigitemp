import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";

const updateLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(20).optional(),
  Lieu_Etat: z.string().max(100).nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  Id_Groupe1: z.number().nullable().optional(),
  Id_Groupe2: z.number().nullable().optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Frequence: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().nullable().optional(),
  Est_Archive: z.boolean().optional(),
});

export const PATCH = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID lieu requis" }, { status: 400 });
    }

    const body = await req.json();
    const validated = updateLieuSchema.parse(body);

    const lieu = await prisma.t_lieu.update({
      where: { Id_Lieu: parseInt(id) },
      data: validated,
    });

    // Convert BigInt to string for JSON serialization
    const serialized = JSON.parse(
      JSON.stringify(lieu, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serialized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[PATCH /api/lieux/[id]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du lieu" },
      { status: 500 }
    );
  }
});
