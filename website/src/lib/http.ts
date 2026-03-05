export type HttpErrorPayload = {
  ok?: false
  error?: string
  message?: string
  errorId?: string
  [key: string]: unknown
}

export type ApiErrorEventDetail = {
  message: string
  status: number
  errorId?: string
  path?: string
}

export type AuthStateEventDetail = {
  disconnected: boolean
  reason?: string
}

export const API_ERROR_EVENT = "vigitemp:api-error"
export const AUTH_STATE_EVENT = "vigitemp:auth-state"

const DISCONNECTED_MESSAGE = "Session expir?e. Reconnectez-vous pour continuer."

let authDisconnected = false
let authRedirectInProgress = false

export class HttpError extends Error {
  readonly status: number
  readonly payload?: HttpErrorPayload

  constructor(message: string, status: number, payload?: HttpErrorPayload) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.payload = payload
  }
}

export function isUnauthorizedError(error: unknown): error is HttpError {
  return error instanceof HttpError && error.status === 401
}

export function isAuthDisconnected() {
  return authDisconnected
}

function dispatchAuthState(disconnected: boolean, reason?: string) {
  if (typeof window === "undefined") return
  const detail: AuthStateEventDetail = { disconnected, reason }
  window.dispatchEvent(new CustomEvent(AUTH_STATE_EVENT, { detail }))
}

function dispatchApiError(detail: ApiErrorEventDetail) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, { detail }))
}

function getLocaleAwareLoginPath(reason: "session-expired" | "inactivity") {
  if (typeof window === "undefined") return null

  const pathname = window.location.pathname || "/"
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/i)
  const localePrefix = match ? `/${match[1]}` : ""
  return `${localePrefix}/login?reason=${reason}`
}

function isPublicAppPath(pathname: string) {
  const normalized = pathname.replace(/^\/([a-z]{2})(?=\/|$)/i, "") || "/"
  return normalized === "/login" || normalized === "/connexion" || normalized === "/reset-password" || normalized === "/reinitialisation-mot-de-passe" || normalized === "/force-password-change" || normalized === "/changement-mot-de-passe-obligatoire"
}

function triggerAuthRedirect(reason: string) {
  if (typeof window === "undefined") return
  if (authRedirectInProgress) return

  const pathname = window.location.pathname || "/"
  if (pathname.includes("/hotline/")) return
  if (isPublicAppPath(pathname)) return

  const targetReason = reason === "auto_logout" ? "inactivity" : "session-expired"
  const target = getLocaleAwareLoginPath(targetReason)
  if (!target) return

  authRedirectInProgress = true
  window.setTimeout(() => {
    window.location.assign(target)
  }, 0)
}

export function setAuthDisconnected(disconnected: boolean, reason?: string) {
  const changed = authDisconnected !== disconnected
  authDisconnected = disconnected
  if (!disconnected) {
    authRedirectInProgress = false
  }
  if (changed) {
    dispatchAuthState(disconnected, reason)
  }
  if (disconnected) {
    triggerAuthRedirect(reason ?? "unauthorized")
  }
}

const ALLOWED_WHEN_DISCONNECTED = new Set<string>([
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password",
  "/api/auth/force-password-change",
  "/api/auth/temp-password-token",
  "/api/auth/validate-password-token",
  "/api/hotline/login",
  "/api/hotline/refresh",
])

function normalizePathname(input: RequestInfo | URL): string | undefined {
  try {
    if (typeof input === "string") {
      const url = input.startsWith("http")
        ? new URL(input)
        : typeof window !== "undefined"
          ? new URL(input, window.location.origin)
          : null
      if (url) return url.pathname
      return input.startsWith("/") ? input.split("?")[0] : undefined
    }
    if (input instanceof URL) return input.pathname
    if (typeof Request !== "undefined" && input instanceof Request) {
      return new URL(input.url).pathname
    }
  } catch {
    return undefined
  }
  return undefined
}

function getClientTraceTag(): string | undefined {
  if (typeof window === "undefined") return undefined
  if (process.env.NODE_ENV === "production") return undefined

  try {
    const stack = new Error().stack
    if (!stack) return undefined

    const lines = stack
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const isIgnorable = (line: string) => {
      const lower = line.toLowerCase()
      return (
        lower.includes("getclienttracetag") ||
        lower.includes("fetchjson") ||
        lower.includes("getjson") ||
        lower.includes("/src/lib/http") ||
        lower.includes("\\src\\lib\\http") ||
        lower.includes("node_modules") ||
        lower.includes("next/dist")
      )
    }

    const stackFrames = lines.filter((line) => line.startsWith("at "))

    const candidate =
      stackFrames.find((line) => line.includes("webpack-internal") && !isIgnorable(line)) ||
      stackFrames.find((line) => line.includes("/src/") && !isIgnorable(line)) ||
      stackFrames.find((line) => !isIgnorable(line))

    if (!candidate) return undefined
    const cleaned = candidate.replace(/^at\s+/, "").slice(0, 180)
    return cleaned || undefined
  } catch {
    return undefined
  }
}

function getQueryClientId(): string | undefined {
  if (typeof window === "undefined") return undefined
  if (process.env.NODE_ENV === "production") return undefined
  try {
    return window.__vigitempQueryClientId
  } catch {
    return undefined
  }
}

function getBootId(): string | undefined {
  if (typeof window === "undefined") return undefined
  if (process.env.NODE_ENV === "production") return undefined
  try {
    return window.__vigitempBootId
  } catch {
    return undefined
  }
}

function getRefreshEndpoint(pathname: string | undefined): string | null {
  if (typeof window === "undefined") return null
  if (!pathname?.startsWith("/api/")) return null
  if (pathname === "/api/auth/refresh" || pathname === "/api/hotline/refresh") return null
  if (pathname === "/api/auth/login" || pathname === "/api/hotline/login") return null
  if (pathname === "/api/auth/logout" || pathname === "/api/auth/logout-auto") return null
  if (pathname === "/api/hotline/logout") return null

  if (pathname.startsWith("/api/hotline/")) return "/api/hotline/refresh"
  return "/api/auth/refresh"
}

export async function fetchJson<TResponse>(input: RequestInfo | URL, init?: RequestInit): Promise<TResponse> {
  const pathname = normalizePathname(input)

  if (
    typeof window !== "undefined" &&
    authDisconnected &&
    pathname?.startsWith("/api/") &&
    !pathname.startsWith("/api/hotline/") &&
    !ALLOWED_WHEN_DISCONNECTED.has(pathname)
  ) {
    const payload: HttpErrorPayload = {
      ok: false,
      error: "session_disconnected",
      message: DISCONNECTED_MESSAGE,
    }
    dispatchApiError({
      message: DISCONNECTED_MESSAGE,
      status: 401,
      path: pathname,
    })
    throw new HttpError(DISCONNECTED_MESSAGE, 401, payload)
  }

  const buildHeaders = () => {
    const headers = new Headers(init?.headers)

    const clientTrace = getClientTraceTag()
    if (clientTrace && !headers.has("x-vigitemp-client-trace")) {
      headers.set("x-vigitemp-client-trace", clientTrace)
    }

    const queryClientId = getQueryClientId()
    if (queryClientId && !headers.has("x-vigitemp-query-client-id")) {
      headers.set("x-vigitemp-query-client-id", queryClientId)
    }

    const bootId = getBootId()
    if (bootId && !headers.has("x-vigitemp-boot-id")) {
      headers.set("x-vigitemp-boot-id", bootId)
    }

    return headers
  }

  const doRequest = async () => {
    const headers = buildHeaders()
    return fetch(input, { ...init, headers })
  }

  let res = await doRequest()

  const refreshEndpoint = getRefreshEndpoint(pathname)
  const isHotlineApi = Boolean(pathname?.startsWith("/api/hotline/"))

  if (res.status === 401 && refreshEndpoint) {
    try {
      const refreshRes = await fetch(refreshEndpoint, {
        method: "POST",
        credentials: "include",
      })

      if (refreshRes.ok) {
        if (!isHotlineApi) setAuthDisconnected(false, "refresh_success")
        res = await doRequest()
      } else if (!isHotlineApi) {
        setAuthDisconnected(true, "unauthorized")
      }
    } catch {
      if (!isHotlineApi) setAuthDisconnected(true, "unauthorized")
    }
  }

  if (pathname === "/api/auth/login" && res.ok) {
    setAuthDisconnected(false, "login_success")
  }
  if ((pathname === "/api/auth/logout" || pathname === "/api/auth/logout-auto") && res.ok) {
    setAuthDisconnected(true, pathname === "/api/auth/logout-auto" ? "auto_logout" : "manual_logout")
  }

  if (res.ok && pathname?.startsWith("/api/") && !pathname.startsWith("/api/hotline/") && authDisconnected) {
    setAuthDisconnected(false, "api_ok")
  }

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const errorId = res.headers.get("x-vigitemp-error-id") || undefined

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    let payload: HttpErrorPayload | undefined

    if (isJson) {
      try {
        payload = (await res.json()) as HttpErrorPayload
        message = (payload?.message as string) || (payload?.error as string) || message
      } catch {
        // ignore
      }
    } else {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {
        // ignore
      }
    }

    if (errorId) {
      payload = { ...(payload ?? {}), errorId }
    }

    if (res.status === 401 && !isHotlineApi) {
      setAuthDisconnected(true, "unauthorized")
    }

    if (res.status >= 500) {
      dispatchApiError({
        message,
        status: res.status,
        errorId,
        path: pathname,
      })
    }

    throw new HttpError(message, res.status, payload)
  }

  if (res.status === 204) return undefined as TResponse

  if (!isJson) {
    const text = await res.text()
    return (text as unknown) as TResponse
  }

  const payload = (await res.json()) as Record<string, unknown>

  if (payload && typeof payload === "object" && payload.ok === true && "data" in payload) {
    return payload.data as TResponse
  }

  return payload as TResponse
}

export function getJson<TResponse>(url: string) {
  return fetchJson<TResponse>(url, { credentials: "include" })
}

export function postJson<TResponse>(url: string, body: unknown) {
  return fetchJson<TResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  })
}

export function patchJson<TResponse>(url: string, body: unknown) {
  return fetchJson<TResponse>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  })
}

export function putJson<TResponse>(url: string, body: unknown) {
  return fetchJson<TResponse>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  })
}

export function deleteJson<TResponse>(url: string) {
  return fetchJson<TResponse>(url, { method: "DELETE", credentials: "include" })
}
