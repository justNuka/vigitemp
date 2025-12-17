import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAuditLog, AUDIT_CODES } from "@/lib/audit";

export async function POST(req: NextRequest) {
  // Récupérer l'utilisateur avant de supprimer le cookie
  const user = getAuthenticatedUser(req);
  
  const response = NextResponse.json({ success: true });

  // Clear JWT cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  // Créer l'audit de déconnexion automatique (timeout)
  if (user) {
    await createAuditLog({
      code: AUDIT_CODES.DECONNEXION,
      username: user.username,
      userProfile: user.profile,
      comment: `Déconnexion de l'utilisateur ${user.username} (inactivité)`,
    });
  }

  return response;
}
