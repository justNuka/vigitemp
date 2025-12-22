import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

/**
 * Génère un token temporaire sécurisé pour le changement de mot de passe forcé
 * Stocké en cookie httpOnly
 */
export const POST = withLogging(async (req: NextRequest) => {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.t_utilisateur.findUnique({
      where: { Login: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Générer un token temporaire (simple token, pas JWT)
    // Valide pendant 30 minutes
    const tempToken = Buffer.from(
      `${username}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    ).toString("base64");

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Stocker le token en cookie httpOnly + secure
    response.cookies.set("force-password-token", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/force-password-change",
    });

    // Stocker aussi le username en cookie (lisible par le client) pour affichage
    response.cookies.set("force-password-username", username, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/force-password-change",
    });

    return response;
  } catch (error) {
    console.error("[AUTH] Token generation error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
});
