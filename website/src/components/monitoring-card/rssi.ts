export const parseRssiValue = (value?: string | null) => {
  if (!value) return null
  const match = value.match(/-?\d+/)
  if (!match) return null
  const numeric = Number(match[0])
  return Number.isFinite(numeric) ? numeric : null
}

export const getRssiLevel = (dbm: number | null) => {
  if (dbm === null) return 0
  if (dbm >= -70) return 5
  if (dbm >= -80) return 4
  if (dbm >= -90) return 3
  if (dbm >= -100) return 2
  return 1
}
