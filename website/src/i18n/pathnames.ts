import { routing } from "./routing"

type Locale = (typeof routing.locales)[number]

export function stripLocalePrefix(pathname: string) {
  const stripped = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "")
  return stripped || "/"
}

export function getLocalizedPathname(pathnameKey: string, locale: Locale) {
  const pathnames = (routing as any).pathnames as Record<string, unknown> | undefined
  const entry = pathnames?.[pathnameKey]

  if (!entry) return pathnameKey
  if (typeof entry === "string") return entry

  if (entry && typeof entry === "object") {
    const map = entry as Record<string, unknown>
    const localized = map[locale] ?? map[routing.defaultLocale]
    if (typeof localized === "string") return localized
  }

  return pathnameKey
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/i)
  const locale = match?.[1]

  if (locale && routing.locales.includes(locale as Locale)) {
    return locale as Locale
  }

  return routing.defaultLocale
}

export function buildLocalizedPath(pathnameKey: string, locale: Locale, query?: Record<string, string>) {
  const localizedPath = getLocalizedPathname(pathnameKey, locale)
  const search = query ? new URLSearchParams(query).toString() : ""

  return `/${locale}${localizedPath}${search ? `?${search}` : ""}`
}

