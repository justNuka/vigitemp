import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { apiError } from "@/lib/api-response";
import { log } from "@/lib/logger";
import { recordRequestError } from "@/lib/request-error-store";

const SENSITIVE_KEYS = new Set(["password", "token", "secret", "currentpassword", "newpassword", "confirmpassword", "accesstoken", "refreshtoken"])

function redactSensitive(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map((item) => redactSensitive(item, depth + 1))
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redactSensitive(value, depth + 1)
  }
  return result
}

function normalizeIp(rawIp?: string | null): string | undefined {
  if (!rawIp) return undefined;
  const trimmed = rawIp.trim();
  if (!trimmed) return undefined;
  const withoutMapped = trimmed.startsWith("::ffff:")
    ? trimmed.slice("::ffff:".length)
    : trimmed;
  return withoutMapped.trim() || undefined;
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0];
  return normalizeIp(forwarded) || normalizeIp(req.headers.get("x-real-ip")) || "unknown";
}

/**
 * Middleware pour logger toutes les requetes API.
 * Ajoute un identifiant d'erreur (x-vigitemp-error-id) sur les reponses en erreur.
 */
export function withLogging(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options?: {
    skipLogging?: boolean;
    label?: string;
  }
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const startTime = Date.now();
    const method = req.method;
    const path = req.nextUrl.pathname;

    const clientTrace = req.headers.get("x-vigitemp-client-trace") || undefined;
    const queryClientId = req.headers.get("x-vigitemp-query-client-id") || undefined;
    const bootId = req.headers.get("x-vigitemp-boot-id") || undefined;

    // Extraire les infos utilisateur du token JWT si present
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
      // Pas de token valide, c'est OK pour les routes publiques
    }

    const ip = getClientIp(req);

    // Clone the request before handing it to the handler so we can read the body later on error
    const reqClone = req.clone();

    const readErrorBody = async (response: NextResponse) => {
      try {
        const clone = response.clone();
        const bodyText = await clone.text();
        const trimmed = bodyText.trim();
        if (!trimmed) {
          return undefined;
        }
        try {
          const parsed = JSON.parse(trimmed) as { message?: string; error?: string; detail?: string; details?: string };
          const message = parsed?.message || parsed?.error || parsed?.detail || parsed?.details;
          if (message) {
            return String(message);
          }
        } catch {
          // ignore JSON parse errors
        }
        return trimmed.length > 2000 ? `${trimmed.slice(0, 2000)}...` : trimmed;
      } catch {
        return undefined;
      }
    };

    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - startTime;
      const errorBody = response.status >= 400 ? await readErrorBody(response) : undefined;

      let requestBody: unknown | undefined;
      if (response.status >= 400 && ["POST", "PUT", "PATCH"].includes(method)) {
        try {
          const bodyText = await reqClone.text();
          if (bodyText.trim()) {
            const parsed: unknown = JSON.parse(bodyText);
            requestBody = redactSensitive(parsed);
          }
        } catch {
          // ignore body read/parse errors
        }
      }

      let errorId: string | undefined;
      if (response.status >= 400) {
        try {
          const recorded = await recordRequestError({
            method,
            path,
            statusCode: response.status,
            message: errorBody || `HTTP ${response.status}`,
            user: user.username,
            userId: user.userId,
            ip,
            clientTrace,
            queryClientId,
            bootId,
          });
          errorId = recorded.id;
          response.headers.set("x-vigitemp-error-id", errorId);
        } catch (storeError) {
          log.warn("API", "Unable to persist request error", {
            method,
            path,
            statusCode: response.status,
            storeError: storeError instanceof Error ? storeError.message : String(storeError),
          });
        }
      }

      if (!options?.skipLogging) {
        log.http(method, path, {
          user: user.username,
          userId: user.userId,
          ip,
          duration,
          statusCode: response.status,
          errorBody,
          requestBody,
          clientTrace,
          queryClientId,
          bootId,
          error: errorId,
        });
      }

      return response;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      let errorId: string | undefined;
      try {
        const recorded = await recordRequestError({
          method,
          path,
          statusCode: 500,
          message: errorMessage,
          user: user.username,
          userId: user.userId,
          ip,
          clientTrace,
          queryClientId,
          bootId,
        });
        errorId = recorded.id;
      } catch (storeError) {
        log.warn("API", "Unable to persist thrown request error", {
          method,
          path,
          storeError: storeError instanceof Error ? storeError.message : String(storeError),
        });
      }

      log.http(method, path, {
        user: user.username,
        userId: user.userId,
        ip,
        duration,
        statusCode: 500,
        error: errorMessage,
        clientTrace,
        queryClientId,
        bootId,
      });

      log.error(options?.label || "API", `Error in ${method} ${path}`, {
        user: user.username,
        userId: user.userId,
        ip,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        errorId,
      });

      return apiError(500, "internal_error", "Internal server error", errorId ? { errorId } : undefined);
    }
  };
}

/**
 * Helper pour obtenir les infos de requete (user, ip) dans les handlers
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
      if (payload) {
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

  const ip = getClientIp(req);

  return { user, ip };
}