export type HttpErrorPayload = {
  ok?: false
  error?: string
  message?: string
  [key: string]: unknown
}

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
    return (window as any).__vigitempQueryClientId
  } catch {
    return undefined
  }
}

function getBootId(): string | undefined {
  if (typeof window === "undefined") return undefined
  if (process.env.NODE_ENV === "production") return undefined
  try {
    return (window as any).__vigitempBootId
  } catch {
    return undefined
  }
}

export async function fetchJson<TResponse>(input: RequestInfo | URL, init?: RequestInit): Promise<TResponse> {
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

  const res = await fetch(input, { ...init, headers })

  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

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

    throw new HttpError(message, res.status, payload)
  }

  if (res.status === 204) return undefined as TResponse

  if (!isJson) {
    const text = await res.text()
    return (text as unknown) as TResponse
  }

  const payload = (await res.json()) as any

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
