"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const RELEASE_VERSION = "0.2.1"
const COOKIE_NAME = "vigitemp_release_seen"

type ChangelogItem = {
  title: string
  details: string[]
}

const CHANGELOG: ChangelogItem[] = [
  {
    title: "Surveillance",
    details: [
      "Cartes harmonisees (boutons, icones de type, tooltips, mode light).",
      "Filtres et actions en couleur primary, tri et vues ajustes.",
      "Derniere valeur et consignes sup/inf dans le tableau.",
    ],
  },
  {
    title: "Mesures et graphiques",
    details: [
      "Date range picker pour filtrer les mesures.",
      "Onglet mesures adapte pour les lieux en surveillance desactivee.",
    ],
  },
  {
    title: "Tables admin",
    details: [
      "Headers fixes avec blur, hauteurs adaptees et bords plus visibles.",
      "Actions harmonisees (icones, tailles, couleurs).",
      "Selection de ligne plus lisible.",
    ],
  },
  {
    title: "Creation et edition",
    details: [
      "Creation de lieux sans sonde avec confirmation.",
      "Type GSO : frequence verouillee a 15 min.",
      "Liste des modules simplifiee.",
    ],
  },
]

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
  const [open, setOpen] = useState(false)
  const isDev = useMemo(() => process.env.NODE_ENV !== "production", [])

  useEffect(() => {
    if (!isDev) return
    const seen = readCookieValue(COOKIE_NAME)
    if (seen !== RELEASE_VERSION) {
      setOpen(true)
    }
  }, [isDev])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSessionCookie(COOKIE_NAME, RELEASE_VERSION)
    }
  }

  if (!isDev) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Nouvelle version {RELEASE_VERSION}</DialogTitle>
          <DialogDescription>
            Nouveautes principales et changements a connaitre.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          {CHANGELOG.map((item, index) => (
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
