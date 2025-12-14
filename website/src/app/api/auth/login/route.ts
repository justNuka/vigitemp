import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { createAuditLog, AUDIT_CODES } from "@/lib/audit";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  const { ip } = getRequestContext(req);
  
  try {
    const body = await req.json();
    const { username, password } = loginSchema.parse(body);

    // Find user by username
    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Login: username,
        Est_Archive: false,
      },
    });

    if (!user) {
      log.auth.login(username, ip, false, "User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a un mot de passe
    if (!user.Mot_De_Passe) {
      log.auth.login(username, ip, false, "No password set");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec bcrypt
    const passwordValid = await bcrypt.compare(password, user.Mot_De_Passe as string);
    
    if (!passwordValid) {
      log.auth.login(username, ip, false, "Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Vérifier l'expiration du mot de passe
    const expiryParams = await prisma.t_parametre.findFirst({
      where: {
        Section: "security:password",
        MotCle: "expiry_enabled",
      },
    });

    const expiryDaysParam = await prisma.t_parametre.findFirst({
      where: {
        Section: "security:password",
        MotCle: "expiry_days",
      },
    });

    const expiryEnabled = expiryParams?.Valeur === "true";
    const expiryDays = parseInt(expiryDaysParam?.Valeur || "90");

    if (expiryEnabled && user.Date_Derniere_Modification_MDP) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(user.Date_Derniere_Modification_MDP).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastChange >= expiryDays) {
        return NextResponse.json(
          {
            error: "password_expired",
            message: `Votre mot de passe a expiré (dernière modification il y a ${daysSinceLastChange} jours). Veuillez le changer.`,
            requirePasswordChange: true,
          },
          { status: 403 }
        );
      }
    }

    // Vérifier si le mot de passe est temporaire (première connexion)
    if (user.Est_Mot_De_Passe_Temporaire) {
      return NextResponse.json(
        {
          error: "temporary_password",
          message: "Vous devez changer votre mot de passe temporaire avant de continuer.",
          requirePasswordChange: true,
          userId: user.Id_Utilisateur,
        },
        { status: 403 }
      );
    }
    // Generate JWT token — profile is stored as a string in `Profil_Utilisateur`.
    // Authorizations relation is not available on `t_utilisateur` in the current schema,
    // so default to an empty array here.
    const authorizations: string[] = [];

    const token = generateToken({
      userId: user.Id_Utilisateur,
      username: user.Login || "user",
      profile: user.Profil_Utilisateur || "user",
      authorizations,
    });

    // Return user data
    const userData = {
      id: user.Id_Utilisateur,
      username: user.Login || "user",
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      profile: user.Profil_Utilisateur || "user",
      authorizations,
      token,
    };

    const response = NextResponse.json(userData);

    // Set JWT cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Créer l'audit de connexion
    await createAuditLog({
      code: AUDIT_CODES.CONNEXION,
      username: user.Login || "unknown",
      userProfile: user.Profil_Utilisateur || "user",
      comment: `Connexion de l'utilisateur ${user.Login}`,
    });

    // Logger la connexion réussie
    log.auth.login(username, ip, true);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
