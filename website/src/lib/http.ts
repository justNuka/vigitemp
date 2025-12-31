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

export async function fetchJson<TResponse>(input: RequestInfo | URL, init?: RequestInit): Promise<TResponse> {
  const res = await fetch(input, init)

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
