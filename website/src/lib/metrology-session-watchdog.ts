type MetrologyWatchdogState = {
  metrologySessionWatchdogs?: Map<string, ReturnType<typeof setTimeout>>
}

const globalState = globalThis as typeof globalThis & MetrologyWatchdogState
const watchdogs = (globalState.metrologySessionWatchdogs ??= new Map<string, ReturnType<typeof setTimeout>>())

export function hasMetrologySessionWatchdog(key: string) {
  return watchdogs.has(key)
}

export function clearMetrologySessionWatchdog(key: string) {
  const timer = watchdogs.get(key)
  if (timer) clearTimeout(timer)
  watchdogs.delete(key)
}

export function scheduleMetrologySessionWatchdog(
  key: string,
  expiresAt: string | number | Date,
  callback: () => Promise<void> | void,
) {
  clearMetrologySessionWatchdog(key)

  const deadline = expiresAt instanceof Date
    ? expiresAt.getTime()
    : typeof expiresAt === "number"
      ? expiresAt
      : new Date(expiresAt).getTime()

  if (!Number.isFinite(deadline)) {
    throw new Error(`Invalid metrology session expiration deadline for ${key}`)
  }

  const delay = Math.max(0, deadline - Date.now())
  const timer = setTimeout(() => {
    watchdogs.delete(key)
    void Promise.resolve(callback())
  }, delay)

  watchdogs.set(key, timer)
}
