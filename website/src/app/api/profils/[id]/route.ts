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
      where: { IdProfil: profileId },
      include: {
        t_liaison_profil_autorisation: {
          include: {
            t_autorisation: true,
          },
        },
        t_utilisateur: {
          select: {
            IdUtilisateur: true,
            Login: true,
            Nom: true,
            Prenom: true,
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

    return NextResponse.json({
      id: profile.IdProfil,
      name: profile.ProfilUtilisateur,
      description: profile.Commentaire,
      mc2: profile.MC2,
      userCount: profile.t_utilisateur.length,
      users: profile.t_utilisateur.map((u) => ({
        id: u.IdUtilisateur,
        username: u.Login,
        displayName: `${u.Prenom || ""} ${u.Nom || ""}`.trim() || u.Login,
      })),
      authorizations: profile.t_liaison_profil_autorisation.map((liaison) => ({
        id: liaison.t_autorisation.IdAutorisation,
        code: liaison.t_autorisation.CodeAutorisation,
        label: liaison.t_autorisation.LibelleAutorisation,
        description: liaison.t_autorisation.Commentaire,
        fenAdmin: liaison.t_autorisation.fenAdmin,
        fenMetrologie: liaison.t_autorisation.fenMetrologie,
        fenSurveillance: liaison.t_autorisation.fenSurveillance,
        fenVigiLog: liaison.t_autorisation.fenVigiLog,
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
    const userProfile = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: user.userId },
      include: {
        t_profil: {
          include: {
            t_liaison_profil_autorisation: {
              include: {
                t_autorisation: true,
              },
            },
          },
        },
      },
    });

    const hasAdminAccess = userProfile?.t_profil?.t_liaison_profil_autorisation.some(
      (liaison) => liaison.t_autorisation.CodeAutorisation === "GERER_PROFIL"
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
      where: { IdProfil: profileId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    // Update profile
    const updateData: any = {};
    if (data.name !== undefined) updateData.ProfilUtilisateur = data.name;
    if (data.description !== undefined) updateData.Commentaire = data.description;
    if (data.mc2 !== undefined) updateData.MC2 = data.mc2;

    if (Object.keys(updateData).length > 0) {
      await prisma.t_profil.update({
        where: { IdProfil: profileId },
        data: updateData,
      });
    }

    // Update authorizations if provided
    if (data.authorizations !== undefined) {
      // Delete existing authorizations
      await prisma.t_liaison_profil_autorisation.deleteMany({
        where: { IdProfil: profileId },
      });

      // Create new authorizations
      if (data.authorizations.length > 0) {
        await prisma.t_liaison_profil_autorisation.createMany({
          data: data.authorizations.map((authId) => ({
            IdProfil: profileId,
            IdAutorisation: authId,
          })),
        });
      }
    }

    // Fetch updated profile
    const updatedProfile = await prisma.t_profil.findUnique({
      where: { IdProfil: profileId },
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
      id: updatedProfile!.IdProfil,
      name: updatedProfile!.ProfilUtilisateur,
      description: updatedProfile!.Commentaire,
      mc2: updatedProfile!.MC2,
      authorizations: updatedProfile!.t_liaison_profil_autorisation.map((liaison) => ({
        id: liaison.t_autorisation.IdAutorisation,
        code: liaison.t_autorisation.CodeAutorisation,
        label: liaison.t_autorisation.LibelleAutorisation,
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
    const userProfile = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: user.userId },
      include: {
        t_profil: {
          include: {
            t_liaison_profil_autorisation: {
              include: {
                t_autorisation: true,
              },
            },
          },
        },
      },
    });

    // Check if user has GERER_PROFIL authorization or is Administrateurs profile
    const hasAdminAccess = 
      userProfile?.t_profil?.ProfilUtilisateur === "Administrateurs" ||
      userProfile?.t_profil?.t_liaison_profil_autorisation.some(
        (liaison) => liaison.t_autorisation.CodeAutorisation === "GERER_PROFIL"
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
      where: { IdProfil: profileId },
      include: {
        t_utilisateur: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      );
    }

    if (profile.t_utilisateur.length > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer ce profil car ${profile.t_utilisateur.length} utilisateur(s) l'utilise(nt)`,
        },
        { status: 400 }
      );
    }

    // Delete authorizations first
    await prisma.t_liaison_profil_autorisation.deleteMany({
      where: { IdProfil: profileId },
    });

    // Delete profile
    await prisma.t_profil.delete({
      where: { IdProfil: profileId },
    });

    // Log profile deletion
    const { ip } = getRequestContext(req);
    log.data.delete(
      "Profil",
      profileId,
      user.username,
      user.userId,
      ip,
      `Suppression du profil ${profile.ProfilUtilisateur}`
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
