import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.t_parametre.findMany({
      orderBy: { Mot_Cle: "asc" },
    });

    const formatted = settings.map((setting: any) => ({
      key: `${setting.Section}:${setting.Mot_Cle}`,
      section: setting.Section,
      motCle: setting.Mot_Cle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update SMTP settings (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get user profile to check GERER_PROFIL authorization
    const currentUserProfileStr = (await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: user.userId },
      select: { Profil_Utilisateur: true },
    }))?.Profil_Utilisateur;

    const userProfile = currentUserProfileStr
      ? await prisma.t_profil.findUnique({
          where: { Profil_Utilisateur: currentUserProfileStr },
          include: { t_liaison_profil_autorisation: { include: { t_autorisation: true } } },
        })
      : null;

    // Check if user has GERER_PROFIL authorization or is Administrateurs profile
    const hasAdminAccess =
      userProfile?.Profil_Utilisateur === "Administrateurs" ||
      userProfile?.t_liaison_profil_autorisation.some(
        (liaison) => liaison.t_autorisation.Code_Autorisation === "GERER_PROFIL"
      );

    if (!hasAdminAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { section, motCle, value } = body;

    if (!section || !motCle) {
      return NextResponse.json(
        { error: "Section et motCle sont requis" },
        { status: 400 }
      );
    }

    // Update or create parameter
    const param = await prisma.t_parametre.upsert({
      where: {
        Section_Mot_Cle: {
          Section: section,
          Mot_Cle: motCle,
        },
      },
      update: {
        Valeur: value,
      },
      create: {
        Section: section,
        Mot_Cle: motCle,
        Valeur: value,
        Commentaire: "",
      },
    });

    return NextResponse.json({
      message: "Paramètre mis à jour",
      param,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
