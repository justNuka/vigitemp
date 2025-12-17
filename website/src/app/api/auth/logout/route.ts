import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAuditLog, AUDIT_CODES } from "@/lib/audit";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";

export async function POST(req: NextRequest) {
  // Récupérer l'utilisateur avant de supprimer le cookie
  const user = getAuthenticatedUser(req);
  const { ip } = getRequestContext(req);
  
  const response = NextResponse.json({ success: true });

  // Clear JWT cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  // Créer l'audit de déconnexion (manuelle)
  if (user) {
    await createAuditLog({
      code: AUDIT_CODES.DECONNEXION,
      username: user.username,
      userProfile: user.profile,
      comment: `Déconnexion de l'utilisateur ${user.username}`,
    });

    // Logger la déconnexion
    log.auth.logout(user.username, user.userId, ip, "Manual logout");
  }

  return response;
}
