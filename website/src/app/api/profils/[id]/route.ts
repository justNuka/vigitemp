import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom du profil est requis").optional(),
  description: z.string().optional(),
  mc2: z.boolean().optional(),
  authorizations: z.array(z.number()).optional(),
});

/**
 * GET /api/profils/[id]
 * Récupère un profil spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const profileId = parseInt(id);

    if (isNaN(profileId)) {
      return NextResponse.json(
        { error: "ID de profil invalide" },
        { status: 400 }
      );
    }

    const profile = await prisma.t_profil.findUnique({
      where: { Id_Profil: profileId },
      include: {
        t_liaison_profil_autorisation: {
          include: {
            t_autorisation: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    // Fetch users that belong to this profile
    const users = await prisma.t_utilisateur.findMany({
      where: { Profil_Utilisateur: profile.Profil_Utilisateur },
      select: { Id_Utilisateur: true, Login: true, Nom: true, Prenom: true },
    });

    return NextResponse.json({
      id: profile.Id_Profil,
      name: profile.Profil_Utilisateur,
      description: profile.Commentaire,
      mc2: profile.Est_MC2,
      userCount: users.length,
      users: users.map((u) => ({
        id: u.Id_Utilisateur,
        username: u.Login,
        displayName: `${u.Prenom || ""} ${u.Nom || ""}`.trim() || u.Login,
      })),
      authorizations: profile.t_liaison_profil_autorisation.map((liaison) => ({
        id: liaison.t_autorisation.Id_Autorisation,
        code: liaison.t_autorisation.Code_Autorisation,
        label: liaison.t_autorisation.Libelle_Autorisation,
        description: liaison.t_autorisation.Commentaire,
        fenAdmin: liaison.t_autorisation.A_Acces_Admin,
        fenMetrologie: liaison.t_autorisation.A_Acces_Metrologie,
        fenSurveillance: liaison.t_autorisation.A_Acces_Surveillance,
        fenVigiLog: liaison.t_autorisation.A_Acces_VigiLog,
      })),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Échec de récupération du profil" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profils/[id]
 * Met à jour un profil
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check admin access
    // Determine if current user has admin access by looking up their profile
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

    const hasAdminAccess = userProfile?.t_liaison_profil_autorisation.some(
      (liaison) => liaison.t_autorisation.Code_Autorisation === "GERER_PROFIL"
    );

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const profileId = parseInt(id);

    if (isNaN(profileId)) {
      return NextResponse.json(
        { error: "ID de profil invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    // Check if profile exists
    const existing = await prisma.t_profil.findUnique({
      where: { Id_Profil: profileId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    // Update profile
    const updateData: any = {};
    if (data.name !== undefined) updateData.Profil_Utilisateur = data.name;
    if (data.description !== undefined) updateData.Commentaire = data.description;
    if (data.mc2 !== undefined) updateData.Est_MC2 = data.mc2;

    if (Object.keys(updateData).length > 0) {
      await prisma.t_profil.update({
        where: { Id_Profil: profileId },
        data: updateData,
      });
    }

    // Update authorizations if provided
    if (data.authorizations !== undefined) {
      // Delete existing authorizations
      await prisma.t_liaison_profil_autorisation.deleteMany({
        where: { Id_Profil: profileId },
      });

      // Create new authorizations
      if (data.authorizations.length > 0) {
        await prisma.t_liaison_profil_autorisation.createMany({
          data: data.authorizations.map((authId) => ({
            Id_Profil: profileId,
            Id_Autorisation: authId,
          })),
        });
      }
    }

    // Fetch updated profile
    const updatedProfile = await prisma.t_profil.findUnique({
      where: { Id_Profil: profileId },
      include: {
        t_liaison_profil_autorisation: {
          include: {
            t_autorisation: true,
          },
        },
      },
    });

    // Log profile update
    const { ip } = getRequestContext(req);
    const changes: any = {};
    if (data.name) changes.name = data.name;
    if (data.description !== undefined) changes.description = data.description;
    if (data.mc2 !== undefined) changes.mc2 = data.mc2;
    if (data.authorizations !== undefined) changes.authorizationCount = data.authorizations.length;
    
    log.data.update(
      "Profil",
      profileId,
      user.username,
      user.userId,
      ip,
      changes
    );

    return NextResponse.json({
      id: updatedProfile!.Id_Profil,
      name: updatedProfile!.Profil_Utilisateur,
      description: updatedProfile!.Commentaire,
      mc2: updatedProfile!.Est_MC2,
      authorizations: updatedProfile!.t_liaison_profil_autorisation.map((liaison) => ({
        id: liaison.t_autorisation.Id_Autorisation,
        code: liaison.t_autorisation.Code_Autorisation,
        label: liaison.t_autorisation.Libelle_Autorisation,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Échec de mise à jour du profil" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profils/[id]
 * Supprime un profil (seulement si aucun utilisateur ne l'utilise)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check admin access
    // Determine if current user has admin access
    const currentUserProfileStr2 = (await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: user.userId },
      select: { Profil_Utilisateur: true },
    }))?.Profil_Utilisateur;

    const userProfile2 = currentUserProfileStr2
      ? await prisma.t_profil.findUnique({
          where: { Profil_Utilisateur: currentUserProfileStr2 },
          include: { t_liaison_profil_autorisation: { include: { t_autorisation: true } } },
        })
      : null;

    const hasAdminAccess =
      userProfile2?.Profil_Utilisateur === "Administrateurs" ||
      userProfile2?.t_liaison_profil_autorisation.some(
        (liaison) => liaison.t_autorisation.Code_Autorisation === "GERER_PROFIL"
      );

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const profileId = parseInt(id);

    if (isNaN(profileId)) {
      return NextResponse.json(
        { error: "ID de profil invalide" },
        { status: 400 }
      );
    }

    // Check if profile has users
    const profile = await prisma.t_profil.findUnique({
      where: { Id_Profil: profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    const userCount = await prisma.t_utilisateur.count({
      where: { Profil_Utilisateur: profile.Profil_Utilisateur },
    });

    if (userCount > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer ce profil car ${userCount} utilisateur(s) l'utilise(nt)`,
        },
        { status: 400 }
      );
    }

    // Delete authorizations first
    await prisma.t_liaison_profil_autorisation.deleteMany({
      where: { Id_Profil: profileId },
    });

    // Delete profile
    await prisma.t_profil.delete({
      where: { Id_Profil: profileId },
    });

    // Log profile deletion
    const { ip } = getRequestContext(req);
    log.data.delete(
      "Profil",
      profileId,
      user.username,
      user.userId,
      ip,
      `Suppression du profil ${profile.Profil_Utilisateur}`
    );

    return NextResponse.json({
      message: "Profil supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { error: "Échec de suppression du profil" },
      { status: 500 }
    );
  }
}
