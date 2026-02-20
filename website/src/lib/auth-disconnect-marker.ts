"use client"

const STORAGE_KEY = "vigitemp:auth-disconnect-reason"
const MAX_AGE_MS = 5 * 60 * 1000

type Marker = {
  reason: string
  ts: number
}

export function markDisconnectReason(reason: string) {
  if (typeof window === "undefined") return
  try {
    const marker: Marker = { reason, ts: Date.now() }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marker))
  } catch {
    // ignore
  }
}

export function consumeDisconnectReason(reason: string) {
  if (typeof window === "undefined") return false
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    window.sessionStorage.removeItem(STORAGE_KEY)
    const marker = JSON.parse(raw) as Marker
    if (!marker || marker.reason !== reason) return false
    return Date.now() - marker.ts <= MAX_AGE_MS
  } catch {
    return false
  }
}

export function clearDisconnectReason() {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
