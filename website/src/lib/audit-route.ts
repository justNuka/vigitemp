import { NextRequest } from "next/server"

import { getClientIp } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import type { JWTPayload } from "@/lib/jwt"

type Primitive = string | number | boolean | null

function normalizeAuditValue(value: unknown): Primitive | Primitive[] | Record<string, unknown> {
  if (value instanceof Date) return value.toISOString()
  if (value === undefined) return null
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAuditValue(item) as Primitive)
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeAuditValue(item)]),
    )
  }
  return String(value)
}

function areAuditValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalizeAuditValue(left)) === JSON.stringify(normalizeAuditValue(right))
}

export function buildAuditChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  trackedFields?: readonly string[],
) {
  const keys = trackedFields
    ? [...trackedFields]
    : Array.from(new Set([
        ...Object.keys(before ?? {}),
        ...Object.keys(after ?? {}),
      ]))

  const changes: Record<string, { from: unknown; to: unknown }> = {}
  for (const key of keys) {
    const previous = before?.[key]
    const next = after?.[key]
    if (areAuditValuesEqual(previous, next)) continue
    changes[key] = {
      from: normalizeAuditValue(previous),
      to: normalizeAuditValue(next),
    }
  }

  return changes
}

export function auditRouteUpdate(req: NextRequest, user: JWTPayload, options: {
  resource: string
  resourceId: number | string
  before: Record<string, unknown> | null | undefined
  after: Record<string, unknown> | null | undefined
  trackedFields?: readonly string[]
  reason?: string
  lieuId?: number
}) {
  const changes = buildAuditChanges(options.before, options.after, options.trackedFields)
  if (Object.keys(changes).length === 0) return

  log.audit("CC", {
    user: user.username,
    userId: user.userId,
    userProfile: user.profile,
    ip: getClientIp(req),
    resource: `${options.resource} (Modification)`,
    resourceId: options.resourceId,
    changes: { action: "update", ...changes },
    reason: options.reason,
    lieuId: options.lieuId,
  })
}

export function auditRouteCreate(req: NextRequest, user: JWTPayload, options: {
  resource: string
  resourceId: number | string
  data?: Record<string, unknown>
  reason?: string
  lieuId?: number
}) {
  log.audit("CC", {
    user: user.username,
    userId: user.userId,
    userProfile: user.profile,
    ip: getClientIp(req),
    resource: `${options.resource} (Cr?ation)`,
    resourceId: options.resourceId,
    changes: { action: "create", ...(options.data ?? {}) },
    reason: options.reason,
    lieuId: options.lieuId,
  })
}

export function auditRouteDelete(req: NextRequest, user: JWTPayload, options: {
  resource: string
  resourceId: number | string
  reason?: string
  data?: Record<string, unknown>
  lieuId?: number
}) {
  log.audit("CC", {
    user: user.username,
    userId: user.userId,
    userProfile: user.profile,
    ip: getClientIp(req),
    resource: `${options.resource} (Suppression)`,
    resourceId: options.resourceId,
    changes: { action: "delete", ...(options.data ?? {}) },
    reason: options.reason,
    lieuId: options.lieuId,
  })
}
