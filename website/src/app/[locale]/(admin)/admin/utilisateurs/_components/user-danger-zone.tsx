"use client"

import { AlertTriangle } from "lucide-react"

import type { User } from "@/lib/api"

import { Button } from "@/components/ui/button"

interface Props {
  user: User | null
  isArchiving: boolean
  onArchive: (user: User) => void
}

export function UserDangerZone({ user, isArchiving, onArchive }: Props) {
  return (
    <div className="space-y-3 pt-4 border-t border-destructive/20">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm font-medium">Zone de danger</p>
      </div>
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Archiver ce compte</p>
            <p className="text-xs text-muted-foreground">
              Le compte sera désactivé et l'utilisateur ne pourra plus se connecter. Cette action peut être annulée en
              réactivant le compte.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => user && onArchive(user)}
            disabled={isArchiving || !user?.isActive}
            className="shrink-0"
          >
            {isArchiving ? "Archivage..." : "Archiver"}
          </Button>
        </div>
      </div>
    </div>
  )
}

