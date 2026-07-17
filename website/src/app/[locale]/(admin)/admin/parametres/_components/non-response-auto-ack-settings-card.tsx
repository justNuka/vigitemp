"use client"

import { useEffect, useMemo, useState } from "react"
import { BellOff, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getJson, patchJson } from "@/lib/http"

type LocationSetting = {
  id: number
  name: string
  sensorSerial: string | null
  enabled: boolean
}

const API_PATH = "/api/parametres/acquittement-auto-non-reponse"

export function NonResponseAutoAckSettingsCard() {
  const [locations, setLocations] = useState<LocationSetting[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    getJson<LocationSetting[]>(API_PATH)
      .then((data) => {
        if (!cancelled) setLocations(data)
      })
      .catch(() => {
        if (!cancelled) toast.error("Impossible de charger les lieux")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return locations
    return locations.filter((location) =>
      `${location.name} ${location.sensorSerial ?? ""}`.toLocaleLowerCase().includes(query),
    )
  }, [locations, search])

  const enabledCount = locations.filter((location) => location.enabled).length
  const isSaving = savingIds.size > 0

  const updateLocations = async (locationIds: number[], enabled: boolean) => {
    if (locationIds.length === 0) return
    const previousLocations = locations
    const targetIds = new Set(locationIds)
    setSavingIds(targetIds)
    setLocations((current) => current.map((location) =>
      targetIds.has(location.id) ? { ...location, enabled } : location,
    ))

    try {
      const result = await patchJson<{ updated: number }>(API_PATH, { locationIds, enabled })
      toast.success(
        result.updated === 0
          ? "Aucun changement nécessaire"
          : `${result.updated} lieu(x) mis à jour`,
      )
    } catch {
      setLocations(previousLocations)
      toast.error("Impossible de mettre à jour les lieux")
    } finally {
      setSavingIds(new Set())
    }
  }

  return (
    <Card className="border-border/60 bg-white dark:bg-popover dark:text-popover-foreground">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
            <BellOff className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>Acquittement automatique des non-réponses</CardTitle>
            <CardDescription>
              Une alarme de non-réponse terminée sera acquittée automatiquement pour les lieux activés.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un lieu ou une sonde"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">
              {enabledCount} activé(s) sur {locations.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || isSaving || locations.length === 0}
              onClick={() => updateLocations(locations.map((location) => location.id), true)}
            >
              Tout cocher
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || isSaving || locations.length === 0}
              onClick={() => updateLocations(locations.map((location) => location.id), false)}
            >
              Tout décocher
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(10rem,0.6fr)_6rem] gap-3 border-b bg-muted/50 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>Lieu</span>
            <span>Sonde</span>
            <span className="text-center">Actif</span>
          </div>
          <ScrollArea className="h-[28rem]">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Aucun lieu trouvé.</div>
            ) : (
              <div className="divide-y">
                {filteredLocations.map((location) => (
                  <label
                    key={location.id}
                    className="grid cursor-pointer grid-cols-[minmax(0,1fr)_minmax(10rem,0.6fr)_6rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate font-medium">{location.name}</span>
                    <span className="min-w-0 truncate text-sm text-muted-foreground">
                      {location.sensorSerial ?? "Non assignée"}
                    </span>
                    <span className="flex justify-center">
                      <Checkbox
                        checked={location.enabled}
                        disabled={isSaving}
                        onCheckedChange={(checked) => updateLocations([location.id], checked === true)}
                        aria-label={`Acquittement automatique pour ${location.name}`}
                      />
                    </span>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <p className="text-xs text-muted-foreground">
          Ce réglage concerne uniquement les alarmes de non-réponse terminées. Les autres types d’alarme restent à acquitter manuellement.
        </p>
      </CardContent>
    </Card>
  )
}
