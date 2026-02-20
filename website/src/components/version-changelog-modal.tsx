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

const RELEASE_VERSION = "0.3.0"
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
  const [open, setOpen] = useState(false)

  const changelog = useMemo<ChangelogItem[]>(
    () => [
      {
        title: t("sections.upgrade.title"),
        details: [
          t("sections.upgrade.items.0"),
          t("sections.upgrade.items.1"),
        ],
      },
      {
        title: t("sections.services.title"),
        details: [t("sections.services.items.0")],
      },
    ],
    [t]
  )

  useEffect(() => {
    const seen = readCookieValue(COOKIE_NAME)
    if (seen !== RELEASE_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSessionCookie(COOKIE_NAME, RELEASE_VERSION)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{t("title", { version: RELEASE_VERSION })}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
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
