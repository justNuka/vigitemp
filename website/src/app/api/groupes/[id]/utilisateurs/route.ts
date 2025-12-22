import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id: idParam } = await params;
    const groupeId = parseInt(idParam);

    if (!groupeId) {
      return NextResponse.json(
        { error: "ID groupe invalide" },
        { status: 400 }
      );
    }

    // Récupérer les utilisateurs associés à ce groupe
    const liaisons = await prisma.t_liaison_utilisateur_groupe.findMany({
      where: {
        Id_Groupe: groupeId,
      },
      select: {
        t_utilisateur: {
          select: {
            Id_Utilisateur: true,
            Nom: true,
            Prenom: true,
            Login: true,
            Est_Archive: true,
          },
        },
      },
    });

    // Extraire les utilisateurs et les filtrer
    const utilisateurs = liaisons
      .filter((l) => l.t_utilisateur && !l.t_utilisateur.Est_Archive)
      .map((l) => ({
        Id_Utilisateur: l.t_utilisateur!.Id_Utilisateur,
        Nom: l.t_utilisateur!.Nom,
        Prenom: l.t_utilisateur!.Prenom,
        Login: l.t_utilisateur!.Login,
      }))
      .sort((a, b) => (a.Nom || "").localeCompare(b.Nom || ""));

    return NextResponse.json(utilisateurs);
  } catch (error) {
    console.error("Utilisateurs fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
});
