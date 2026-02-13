import { NextRequest, NextResponse } from "next/server"

import { withLogging } from "@/lib/api-logger"
import { apiError } from "@/lib/api-response"

const AGENT_URLS = ["http://127.0.0.1:8000", "http://localhost:8000"] as const
const ALLOWED_PATHS = new Set(["/session", "/info", "/agent-secret"])
const METHODS = new Set(["GET", "POST", "DELETE"])

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

function normalizeProxyPath(pathParts: string[] | undefined): string | null {
  if (!pathParts || pathParts.length === 0) return null
  const value = `/${pathParts.join("/")}`
  return ALLOWED_PATHS.has(value) ? value : null
}

async function forward(req: NextRequest, path: string) {
  if (!METHODS.has(req.method)) {
    return apiError(405, "method_not_allowed", "Method not allowed")
  }

  const body = req.method === "GET" || req.method === "DELETE" ? undefined : await req.text()

  for (const baseUrl of AGENT_URLS) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: req.method,
        headers: body ? { "Content-Type": req.headers.get("content-type") || "application/json" } : undefined,
        body,
        signal: createTimeoutSignal(1200),
      })

      const text = await res.text()
      const response = new NextResponse(text, { status: res.status })
      const contentType = res.headers.get("content-type")
      if (contentType) response.headers.set("content-type", contentType)
      return response
    } catch {
      // try next loopback URL
    }
  }

  return apiError(503, "agent_unavailable", "Agent unavailable")
}

const handler = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => {
    const { path: pathParts } = await params
    const normalizedPath = normalizeProxyPath(pathParts)
    if (!normalizedPath) {
      return apiError(404, "not_found", "Not found")
    }

    return forward(req, normalizedPath)
  },
  { label: "AGENT_PROXY" },
)

export const GET = handler
export const POST = handler
export const DELETE = handler

