import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

export const PATCH = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (!id) {
      return NextResponse.json(
        { error: "ID actionneur invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type, serie, commentaire, lieuId } = body;

    // Vérifier que l'actionneur existe
    const actionneur = await prisma.t_actionneur.findUnique({
      where: { Id_Actionneur: id },
    });

    if (!actionneur) {
      return NextResponse.json(
        { error: "Actionneur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour l'actionneur
    const updated = await prisma.t_actionneur.update({
      where: { Id_Actionneur: id },
      data: {
        Type: type ? parseInt(type) : actionneur.Type,
        Num_Serie: serie || actionneur.Num_Serie,
        Commentaire: commentaire || actionneur.Commentaire,
      },
    });

    // Gérer la liaison avec le lieu
    if (lieuId) {
      const newLieuId = parseInt(lieuId);

      // Trouver l'ancien lieu associé (s'il existe)
      const oldLieu = await prisma.t_lieu.findFirst({
        where: { Id_Actionneur: id },
        select: { Id_Lieu: true },
      });

      // Si c'est un lieu différent, mettre à jour les liaisons
      if (oldLieu && oldLieu.Id_Lieu !== newLieuId) {
        // Nettoyer l'ancien lieu
        await prisma.t_lieu.update({
          where: { Id_Lieu: oldLieu.Id_Lieu },
          data: { Id_Actionneur: null },
        });

        // Lier au nouveau lieu
        await prisma.t_lieu.update({
          where: { Id_Lieu: newLieuId },
          data: { Id_Actionneur: id },
        });
      } else if (!oldLieu) {
        // Première liaison
        await prisma.t_lieu.update({
          where: { Id_Lieu: newLieuId },
          data: { Id_Actionneur: id },
        });
      }
    } else {
      // Supprimer toute liaison si lieuId est vide
      await prisma.t_lieu.updateMany({
        where: { Id_Actionneur: id },
        data: { Id_Actionneur: null },
      });
    }

    // Récupérer l'actionneur mis à jour avec le lieu
    const lieu = await prisma.t_lieu.findFirst({
      where: { Id_Actionneur: id },
      select: { Id_Lieu: true },
    });

    return NextResponse.json({
      ...updated,
      Id_Lieu: lieu?.Id_Lieu || null,
    });
  } catch (error) {
    console.error("Actionneur update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'actionneur" },
      { status: 500 }
    );
  }
});
