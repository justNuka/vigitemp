"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const RELEASE_VERSION = "0.1.2"
const COOKIE_NAME = "vigitemp_release_seen"

type ChangelogItem = {
  title: string
  details: string[]
}

const CHANGELOG: ChangelogItem[] = [
  {
    title: "Acquittement des alarmes",
    details: [
      "Acquittement depuis le dashboard d'accueil.",
      "Compteur d'alarmes mis a jour instantanement.",
    ],
  },
  {
    title: "Surveillance - mesures",
    details: [
      "Graphiques mini et detail synchronises.",
      "Rechargement des consignes apres modification.",
      "Tri des mesures (ASC/DESC) avec ordre croissant par defaut.",
    ],
  },
  {
    title: "Portail hotline",
    details: [
      "Portail pour la hotline afin de détecter rapidement les problèmes.",
      "Consultation des logs et diagnostics.",
    ],
  },
  {
    title: "Installateurs offline",
    details: [
      "Scripts de preparation des builds.",
      "Verification post-installation.",
    ],
  },
  {
    title: "Surveillance",
    details: [
      "Mise en cache dev et reduction des rechargements.",
      "Ameliorations des tables et export.",
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
          <DialogTitle className="text-lg">
            Nouvelle version {RELEASE_VERSION}
          </DialogTitle>
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
