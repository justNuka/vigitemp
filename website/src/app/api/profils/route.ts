import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";

/**
 * GET /api/profils
 * Récupère la liste de tous les profils avec leurs autorisations
 */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user has admin permissions (GERER_PROFIL authorization)
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
        { error: "Accès non autorisé. Vous devez avoir l'autorisation GERER_PROFIL." },
        { status: 403 }
      );
    }

    // Get all profiles with their authorizations
    const profiles = await prisma.t_profil.findMany({
      include: {
        t_liaison_profil_autorisation: {
          include: {
            t_autorisation: true,
          },
        },
        t_utilisateur: {
          select: {
            IdUtilisateur: true,
          },
        },
      },
      orderBy: {
        ProfilUtilisateur: "asc",
      },
    });

    const formatted = profiles.map((profile) => ({
      id: profile.IdProfil,
      name: profile.ProfilUtilisateur,
      description: profile.Commentaire,
      mc2: profile.MC2,
      userCount: profile.t_utilisateur.length,
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
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get profiles error:", error);
    return NextResponse.json(
      { error: "Échec de récupération des profils" },
      { status: 500 }
    );
  }
}

const createProfileSchema = z.object({
  name: z.string().min(1, "Le nom du profil est requis"),
  description: z.string().optional(),
  mc2: z.boolean().optional().default(false),
  authorizations: z.array(z.number()).optional().default([]),
});

/**
 * POST /api/profils
 * Crée un nouveau profil
 */
export async function POST(req: NextRequest) {
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
        { error: "Accès non autorisé. Vous devez avoir l'autorisation GERER_PROFIL." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = createProfileSchema.parse(body);

    // Check if profile name already exists
    const existing = await prisma.t_profil.findUnique({
      where: { ProfilUtilisateur: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un profil avec ce nom existe déjà" },
        { status: 400 }
      );
    }

    // Create profile
    const profile = await prisma.t_profil.create({
      data: {
        ProfilUtilisateur: data.name,
        Commentaire: data.description || null,
        MC2: data.mc2,
      },
    });

    // Link authorizations
    if (data.authorizations && data.authorizations.length > 0) {
      await prisma.t_liaison_profil_autorisation.createMany({
        data: data.authorizations.map((authId) => ({
          IdProfil: profile.IdProfil,
          IdAutorisation: authId,
        })),
      });
    }

    // Fetch the complete profile with authorizations
    const completeProfile = await prisma.t_profil.findUnique({
      where: { IdProfil: profile.IdProfil },
      include: {
        t_liaison_profil_autorisation: {
          include: {
            t_autorisation: true,
          },
        },
      },
    });

    // Log profile creation
    const { ip } = getRequestContext(req);
    log.data.create(
      "Profil",
      profile.IdProfil,
      user.username,
      user.userId,
      ip,
      {
        name: data.name,
        authorizationCount: data.authorizations?.length || 0,
        mc2: data.mc2,
      }
    );

    return NextResponse.json(
      {
        id: completeProfile!.IdProfil,
        name: completeProfile!.ProfilUtilisateur,
        description: completeProfile!.Commentaire,
        mc2: completeProfile!.MC2,
        authorizations: completeProfile!.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.IdAutorisation,
          code: liaison.t_autorisation.CodeAutorisation,
          label: liaison.t_autorisation.LibelleAutorisation,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Échec de création du profil" },
      { status: 500 }
    );
  }
}
