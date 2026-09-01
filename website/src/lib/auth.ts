import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";

/**
 * Récupère l'utilisateur authentifié depuis le token JWT dans les cookies
 * @param req NextRequest
 * @returns Payload JWT ou null si non authentifié
 */
export function getAuthenticatedUser(req: NextRequest): JWTPayload | null {
  // Standard: "token" (nouveau code). Compat: "auth-token" (legacy).
  const token =
    req.cookies.get("token")?.value ?? req.cookies.get("auth-token")?.value;
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}
