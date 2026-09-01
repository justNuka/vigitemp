export const toOptionalNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  const numeric = Number(value)
  return Number.isNaN(numeric) ? undefined : numeric
}

export const toOptionalNonNegativeInteger = (value: unknown) => {
  const numeric = toOptionalNumber(value)
  return numeric === undefined ? undefined : Math.max(0, Math.trunc(numeric))
}
