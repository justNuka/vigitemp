export function toApiUtcBoundary(date: Date, boundary: "start" | "end" = "start"): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  const time = boundary === "end" ? "23:59:59.999" : "00:00:00.000"
  return `${year}-${month}-${day}T${time}Z`
}

export function toApiUtcDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  const millis = String(date.getMilliseconds()).padStart(3, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}Z`
}

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
