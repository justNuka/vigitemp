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
      },
      orderBy: {
        Profil_Utilisateur: "asc",
      },
    });

    // For each profile, count users with matching Profil_Utilisateur
    const formatted = await Promise.all(profiles.map(async (profile) => {
      const userCount = await prisma.t_utilisateur.count({ where: { Profil_Utilisateur: profile.Profil_Utilisateur } });
      return {
        id: profile.Id_Profil,
        name: profile.Profil_Utilisateur,
        description: profile.Commentaire,
        userCount,
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
      };
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

    // Check admin access via the user's profile string
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
      return NextResponse.json(
        { error: "Accès non autorisé. Vous devez avoir l'autorisation GERER_PROFIL." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = createProfileSchema.parse(body);

    // Check if profile name already exists
    const existing = await prisma.t_profil.findUnique({
      where: { Profil_Utilisateur: data.name },
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
        Profil_Utilisateur: data.name,
        Commentaire: data.description || null,
      },
    });

    // Link authorizations
    if (data.authorizations && data.authorizations.length > 0) {
      await prisma.t_liaison_profil_autorisation.createMany({
        data: data.authorizations.map((authId) => ({
          Id_Profil: profile.Id_Profil,
          Id_Autorisation: authId,
        })),
      });
    }

    // Fetch the complete profile with authorizations
    const completeProfile = await prisma.t_profil.findUnique({
      where: { Id_Profil: profile.Id_Profil },
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
      profile.Id_Profil,
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
        id: completeProfile!.Id_Profil,
        name: completeProfile!.Profil_Utilisateur,
        description: completeProfile!.Commentaire,
        authorizations: completeProfile!.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.Id_Autorisation,
          code: liaison.t_autorisation.Code_Autorisation,
          label: liaison.t_autorisation.Libelle_Autorisation,
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
