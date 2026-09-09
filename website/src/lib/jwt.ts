import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const jwtSecretEnv = process.env.JWT_SECRET
  if (!jwtSecretEnv) {
    throw new Error(
      "[SECURITY] JWT_SECRET environment variable is not set. " +
      "Set it to a strong random string (min 32 chars) before starting the server."
    )
  }
  return jwtSecretEnv
}

export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60; // 1h
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h absolues depuis la connexion
export const REFRESH_COOKIE_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;

export interface JWTPayload {
  userId: number;
  username: string;
  profile: string;
  authorizations?: string[];
  tokenType?: "access" | "refresh";
  sessionExpiresAt?: number;
  iat?: number;
  exp?: number;
}

function getRemainingLifetimeSeconds(maxAgeSeconds: number, absoluteExpiry?: number): number {
  if (absoluteExpiry === undefined) return maxAgeSeconds;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return Math.max(1, Math.min(maxAgeSeconds, absoluteExpiry - nowSeconds));
}

export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp" | "tokenType" | "sessionExpiresAt">,
  sessionExpiresAt?: number,
): string {
  return jwt.sign(
    { ...payload, tokenType: "access" },
    getJwtSecret(),
    { expiresIn: getRemainingLifetimeSeconds(ACCESS_COOKIE_MAX_AGE_SECONDS, sessionExpiresAt) },
  );
}

export function getRefreshSessionExpiresAt(payload: JWTPayload): number | null {
  if (typeof payload.sessionExpiresAt === "number" && Number.isFinite(payload.sessionExpiresAt)) {
    return payload.sessionExpiresAt;
  }

  // Compatibilite avec les refresh tokens emis avant l'ajout de la borne absolue.
  // Ils restent utilisables au maximum 24 h apres leur derniere emission.
  if (typeof payload.iat === "number" && Number.isFinite(payload.iat)) {
    return payload.iat + SESSION_MAX_AGE_SECONDS;
  }

  return null;
}

export function generateRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp" | "authorizations" | "tokenType" | "sessionExpiresAt">,
  sessionExpiresAt?: number,
): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const absoluteExpiry = sessionExpiresAt ?? nowSeconds + SESSION_MAX_AGE_SECONDS;

  return jwt.sign(
    { ...payload, tokenType: "refresh", sessionExpiresAt: absoluteExpiry },
    getJwtSecret(),
    { expiresIn: getRemainingLifetimeSeconds(SESSION_MAX_AGE_SECONDS, absoluteExpiry) },
  );
}

// Compat legacy
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp" | "tokenType" | "sessionExpiresAt">): string {
  return generateAccessToken(payload);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    if (decoded.tokenType && decoded.tokenType !== "access") return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    if (decoded.tokenType !== "refresh") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Vérifie et décode un token JWT (compat: access token)
 */
export function verifyToken(token: string): JWTPayload | null {
  return verifyAccessToken(token);
}

/**
 * Décode un token sans vérification (utile pour le débogage)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}