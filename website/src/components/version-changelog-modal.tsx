"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { stripLocalePrefix } from "@/i18n/pathnames"
import { WEB_APP_VERSION } from "@/lib/app-version"

const RELEASE_VERSION = WEB_APP_VERSION
const COOKIE_NAME = "vigitemp_release_seen"

type ChangelogItem = {
  title: string
  details: string[]
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") return null
  const prefix = `${name}=`
  const parts = document.cookie.split(";")
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length)
    }
  }
  return null
}

function setSessionCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${value}; path=/; samesite=lax`
}

export function VersionChangelogModal() {
  const t = useTranslations("versionChangelog")
  const pathname = usePathname()
  const normalizedPathname = stripLocalePrefix(pathname || "")
  const isPublicRoute =
    normalizedPathname === "/login" ||
    normalizedPathname === "/connexion" ||
    normalizedPathname === "/reset-password" ||
    normalizedPathname === "/reinitialisation-mot-de-passe" ||
    normalizedPathname === "/force-password-change" ||
    normalizedPathname === "/changement-mot-de-passe-obligatoire" ||
    normalizedPathname === "/legal-notice" ||
    normalizedPathname === "/mentions-legales" ||
    normalizedPathname === "/data-protection" ||
    normalizedPathname === "/protection-des-donnees"
  const [open, setOpen] = useState(false)

  const changelog = useMemo<ChangelogItem[]>(
    () => [
      {
        title: t("sections.surveillance.title"),
        details: [
          t("sections.surveillance.items.0"),
          t("sections.surveillance.items.1"),
          t("sections.surveillance.items.2"),
          t("sections.surveillance.items.3"),
        ],
      },
      {
        title: t("sections.metrology.title"),
        details: [
          t("sections.metrology.items.0"),
          t("sections.metrology.items.1"),
          t("sections.metrology.items.2"),
          t("sections.metrology.items.3"),
          t("sections.metrology.items.4"),
        ],
      },
      {
        title: t("sections.admin.title"),
        details: [
          t("sections.admin.items.0"),
          t("sections.admin.items.1"),
          t("sections.admin.items.2"),
          t("sections.admin.items.3"),
          t("sections.admin.items.4"),
        ],
      },
      {
        title: t("sections.security.title"),
        details: [
          t("sections.security.items.0"),
          t("sections.security.items.1"),
          t("sections.security.items.2"),
          t("sections.security.items.3"),
        ],
      },
      {
        title: t("sections.telephony.title"),
        details: [
          t("sections.telephony.items.0"),
          t("sections.telephony.items.1"),
          t("sections.telephony.items.2"),
        ],
      },
      {
        title: t("sections.platform.title"),
        details: [
          t("sections.platform.items.0"),
          t("sections.platform.items.1"),
          t("sections.platform.items.2"),
          t("sections.platform.items.3"),
        ],
      },
    ],
    [t]
  )

  useEffect(() => {
    if (isPublicRoute) return

    const seen = readCookieValue(COOKIE_NAME)
    if (seen !== RELEASE_VERSION) {
      const syncTimer = window.setTimeout(() => {
        setOpen(true)
      }, 0)

      return () => {
        window.clearTimeout(syncTimer)
      }
    }
  }, [isPublicRoute])

  if (isPublicRoute) return null

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSessionCookie(COOKIE_NAME, RELEASE_VERSION)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg">{t("title", { version: RELEASE_VERSION })}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex-1 space-y-6 overflow-y-auto pr-2">
          {changelog.map((item, index) => (
            <div key={`${item.title}-${index}`} className="relative pl-6">
              <div className="absolute left-1 top-1 h-full w-px bg-border" />
              <div className="absolute left-0 top-1 h-3 w-3 rounded-full border border-primary bg-background" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {item.details.map((detail, detailIndex) => (
                    <li key={`${item.title}-${detailIndex}`} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
