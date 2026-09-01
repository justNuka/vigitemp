import { NextRequest } from "next/server"

export function getCompatEnv(newName: string, legacyName: string): string | undefined {
  const nextValue = process.env[newName]?.trim()
  if (nextValue) return nextValue
  const legacyValue = process.env[legacyName]?.trim()
  return legacyValue || undefined
}

export function getCompatHeader(req: NextRequest, newName: string, legacyName: string): string | undefined {
  return req.headers.get(newName)?.trim() || req.headers.get(legacyName)?.trim() || undefined
}

export function hasCompatHeader(headers: Headers, newName: string, legacyName: string) {
  return headers.has(newName) || headers.has(legacyName)
}

