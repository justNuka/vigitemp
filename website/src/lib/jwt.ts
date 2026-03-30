import jwt from "jsonwebtoken";

const jwtSecretEnv = process.env.JWT_SECRET
if (!jwtSecretEnv) {
  throw new Error(
    "[SECURITY] JWT_SECRET environment variable is not set. " +
    "Set it to a strong random string (min 32 chars) before starting the server."
  )
}
const JWT_SECRET: string = jwtSecretEnv

export const ACCESS_TOKEN_EXPIRES_IN = "1h";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60; // 1h
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7j

export interface JWTPayload {
  userId: number;
  username: string;
  profile: string;
  authorizations?: string[];
  tokenType?: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export function generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp" | "tokenType">): string {
  return jwt.sign({ ...payload, tokenType: "access" }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp" | "authorizations" | "tokenType">): string {
  return jwt.sign({ ...payload, tokenType: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

// Compat legacy
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp" | "tokenType">): string {
  return generateAccessToken(payload);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.tokenType && decoded.tokenType !== "access") return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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
