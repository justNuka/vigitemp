import { NextResponse } from "next/server"

export type ApiOk<TData> = {
  ok: true
  data: TData
}

export type ApiError = {
  ok: false
  error: string
  message: string
}

export function apiOk<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data } satisfies ApiOk<TData>, init)
}

export function apiError(
  status: number,
  error: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { ok: false, error, message, ...(extra ?? {}) } satisfies ApiError & Record<string, unknown>,
    { status },
  )
}
