// Module-level in-memory store for typing indicators.
// Works for single-instance deployments.

const typingStore = new Map<number, Map<number, number>>()

export function setTyping(convId: number, userId: number, ttlMs = 4000): void {
  let convMap = typingStore.get(convId)
  if (!convMap) {
    convMap = new Map()
    typingStore.set(convId, convMap)
  }
  convMap.set(userId, Date.now() + ttlMs)
}

export function clearTyping(convId: number, userId: number): void {
  typingStore.get(convId)?.delete(userId)
}

export function getTypingUserIds(convId: number): number[] {
  const convMap = typingStore.get(convId)
  if (!convMap) return []
  const now = Date.now()
  const expired: number[] = []
  const active: number[] = []
  for (const [userId, expiresAt] of convMap.entries()) {
    if (expiresAt < now) {
      expired.push(userId)
    } else {
      active.push(userId)
    }
  }
  for (const userId of expired) {
    convMap.delete(userId)
  }
  return active
}
