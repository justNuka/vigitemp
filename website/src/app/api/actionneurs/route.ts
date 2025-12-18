import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const actionneurs = await prisma.t_actionneur.findMany({
      select: {
        Id_Actionneur: true,
        Num_Serie: true,
        Type: true,
        Commentaire: true,
        Est_Etat: true,
        Est_Archive: true,
      },
      where: {
        Est_Archive: false,
      },
      orderBy: {
        Num_Serie: "asc",
      },
    });

    // Récupérer le lieu associé pour chaque actionneur
    const actionneursWithLieu = await Promise.all(
      actionneurs.map(async (actionneur) => {
        const lieu = await prisma.t_lieu.findFirst({
          where: { Id_Actionneur: actionneur.Id_Actionneur },
          select: { Id_Lieu: true },
        });
        return {
          ...actionneur,
          Id_Lieu: lieu?.Id_Lieu || null,
        };
      })
    );

    return NextResponse.json(actionneursWithLieu);
  } catch (error) {
    console.error("Actionneurs fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des actionneurs" },
      { status: 500 }
    );
  }
});

export const POST = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, serie, commentaire, lieuId } = body;

    // Créer l'actionneur
    const actionneur = await prisma.t_actionneur.create({
      data: {
        Type: type ? parseInt(type) : undefined,
        Num_Serie: serie || null,
        Commentaire: commentaire || null,
      },
    });

    // Si un lieu est sélectionné, mettre à jour le lieu avec l'ID de l'actionneur
    if (lieuId) {
      await prisma.t_lieu.update({
        where: { Id_Lieu: parseInt(lieuId) },
        data: { Id_Actionneur: actionneur.Id_Actionneur },
      });
    }

    return NextResponse.json(actionneur, { status: 201 });
  } catch (error) {
    console.error("Actionneur creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'actionneur" },
      { status: 500 }
    );
  }
});
