import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/api-logger";

/**
 * Valide le token temporaire de changement de mot de passe forcé
 * Retourne le username si le token est valide
 */
export const POST = withLogging(async (req: NextRequest) => {
  try {
    // Récupérer le token depuis les cookies httpOnly
    const token = req.cookies.get("force-password-token")?.value;
    const username = req.cookies.get("force-password-username")?.value;

    if (!token || !username) {
      return NextResponse.json(
        { error: "Token expiré ou invalide" },
        { status: 401 }
      );
    }

    // Le token a été créé avec format: base64(username:timestamp:random)
    try {
      const decodedToken = Buffer.from(token, "base64").toString("utf-8");
      const [tokenUsername, timestamp] = decodedToken.split(":");

      // Vérifier que le username correspond
      if (tokenUsername !== username) {
        return NextResponse.json(
          { error: "Token invalide" },
          { status: 401 }
        );
      }

      // Vérifier que le token n'a pas plus de 30 minutes
      const tokenTime = parseInt(timestamp, 10);
      const nowTime = Date.now();
      const ageMinutes = (nowTime - tokenTime) / (1000 * 60);

      if (ageMinutes > 30) {
        // Effacer les cookies
        const response = NextResponse.json(
          { error: "Token expiré" },
          { status: 401 }
        );
        response.cookies.delete("force-password-token");
        response.cookies.delete("force-password-username");
        return response;
      }

      // Token valide
      return NextResponse.json(
        { success: true, username },
        { status: 200 }
      );
    } catch (err) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("[AUTH] Token validation error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}, { skipLogging: true });
