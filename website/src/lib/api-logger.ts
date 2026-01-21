import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import { verifyToken } from "@/lib/jwt";

/**
 * Middleware pour logger toutes les requêtes API
 * À utiliser dans chaque route API
 */
export function withLogging(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options?: {
    skipLogging?: boolean;
    label?: string;
  }
) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const method = req.method;
    const path = req.nextUrl.pathname;
    const clientTrace = req.headers.get("x-vigitemp-client-trace") || undefined;
    const queryClientId = req.headers.get("x-vigitemp-query-client-id") || undefined;
    const bootId = req.headers.get("x-vigitemp-boot-id") || undefined;
    
    // Extraire les infos utilisateur du token JWT si présent
    let user: { username?: string; userId?: number } = {};
    try {
      const token = req.cookies.get("auth-token")?.value;
      if (token) {
        const payload = verifyToken(token);

        if (payload) {
          user = {
            username: payload.username,
            userId: payload.userId,
          };
        }
      }
    } catch {
      // Pas de token valide, c'est ok pour les routes publiques
    }

    // Extraire l'IP
    const ip = 
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const readErrorBody = async (response: NextResponse) => {
      try {
        const clone = response.clone();
        const bodyText = await clone.text();
        const trimmed = bodyText.trim();
        if (!trimmed) {
          return undefined;
        }
        return trimmed.length > 2000 ? `${trimmed.slice(0, 2000)}…` : trimmed;
      } catch {
        return undefined;
      }
    };

    try {
      // Exécuter le handler
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;
      const errorBody = response.status >= 400 ? await readErrorBody(response) : undefined;

      // Logger la requête réussie
      if (!options?.skipLogging) {
        log.http(method, path, {
          user: user.username,
          userId: user.userId,
          ip,
          duration,
          statusCode: response.status,
          errorBody,
          clientTrace,
          queryClientId,
          bootId,
        });
      }

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Logger l'erreur
      log.http(method, path, {
        user: user.username,
        userId: user.userId,
        ip,
        duration,
        statusCode: 500,
        error: error.message || "Unknown error",
        clientTrace,
        queryClientId,
        bootId,
      });

      log.error(options?.label || "API", `Error in ${method} ${path}`, {
        user: user.username,
        userId: user.userId,
        ip,
        error: error.message,
        stack: error.stack,
      });

      // Re-throw pour que Next.js gère l'erreur
      throw error;
    }
  };
}

/**
 * Helper pour obtenir les infos de requête (user, ip) dans les handlers
 */
export function getRequestContext(req: NextRequest): {
  user?: { username: string; userId: number; profile: string };
  ip: string;
} {
  let user: { username: string; userId: number; profile: string } | undefined;
  
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (token) {
      const payload = verifyToken(token);
      if(payload) {
          user = {
          username: payload.username,
          userId: payload.userId,
          profile: payload.profile,
        };
      }
    }
  } catch {
    // Pas de token valide
  }

  const ip = 
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return { user, ip };
}
