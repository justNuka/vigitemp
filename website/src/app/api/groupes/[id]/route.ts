import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

export const PATCH = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = parseInt(url.pathname.split("/").pop() || "0");

    if (!id) {
      return NextResponse.json(
        { error: "ID groupe invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { nom, regroupement } = body;

    const groupe = await prisma.t_groupe.findUnique({
      where: { Id_Groupe: id },
    });

    if (!groupe) {
      return NextResponse.json(
        { error: "Groupe non trouvé" },
        { status: 404 }
      );
    }

    const updated = await prisma.t_groupe.update({
      where: { Id_Groupe: id },
      data: {
        Nom_Groupe: nom || groupe.Nom_Groupe,
        Numero_Regroupement: regroupement || groupe.Numero_Regroupement,
      },
    });

    const nombre_lieux = await prisma.t_lieu.count({
      where: {
        Est_Archive: false,
        t_lieu_groupe: { some: { Id_Groupe: id } },
      },
    });

    return NextResponse.json({
      Id_Groupe: updated.Id_Groupe,
      Nom_Groupe: updated.Nom_Groupe,
      Numero_Regroupement: updated.Numero_Regroupement,
      Est_Archive: updated.Est_Archive,
      nombre_lieux,
    });
  } catch (error) {
    console.error("Groupe update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du groupe" },
      { status: 500 }
    );
  }
});
