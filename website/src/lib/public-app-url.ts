import type { NextRequest } from "next/server"

function normalizeBaseUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/$/, "");
}

function getRequestOrigin(req?: NextRequest | null): string | null {
  if (!req) return null;

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    return `${forwardedProto || "http"}://${forwardedHost}`.replace(/\/$/, "");
  }

  const origin = req.nextUrl?.origin ?? null;
  return normalizeBaseUrl(origin);
}

export function getPublicAppUrl(req?: NextRequest | null): string {
  const configured = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (configured) {
    return configured;
  }

  const requestOrigin = getRequestOrigin(req);
  if (requestOrigin) {
    return requestOrigin;
  }

  return "http://localhost:3000";
}
