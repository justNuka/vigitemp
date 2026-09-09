"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("adminSettings.non_response_auto_ack")
  const tAdmin = useTranslations("adminSettings")
  const [savedLocations, setSavedLocations] = useState<LocationSetting[]>([])
  const [locations, setLocations] = useState<LocationSetting[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getJson<LocationSetting[]>(API_PATH)
      .then((data) => {
        if (!cancelled) {
          setSavedLocations(data)
          setLocations(data)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error(t("load_error"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [t])

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return locations
    return locations.filter((location) =>
      `${location.name} ${location.sensorSerial ?? ""}`.toLocaleLowerCase().includes(query),
    )
  }, [locations, search])

  const savedStateById = useMemo(
    () => new Map(savedLocations.map((location) => [location.id, location.enabled])),
    [savedLocations],
  )
  const changedLocations = useMemo(
    () => locations.filter((location) => savedStateById.get(location.id) !== location.enabled),
    [locations, savedStateById],
  )
  const hasChanges = changedLocations.length > 0
  const enabledCount = locations.filter((location) => location.enabled).length

  const setDraftLocations = (locationIds: number[], enabled: boolean) => {
    if (locationIds.length === 0) return
    const targetIds = new Set(locationIds)
    setLocations((current) => current.map((location) =>
      targetIds.has(location.id) ? { ...location, enabled } : location,
    ))
  }

  const handleSave = async () => {
    if (!hasChanges || saving) return

    const enableIds = changedLocations.filter((location) => location.enabled).map((location) => location.id)
    const disableIds = changedLocations.filter((location) => !location.enabled).map((location) => location.id)
    const changedCount = changedLocations.length
    setSaving(true)

    try {
      if (enableIds.length > 0) {
        await patchJson<{ updated: number }>(API_PATH, { locationIds: enableIds, enabled: true })
      }
      if (disableIds.length > 0) {
        await patchJson<{ updated: number }>(API_PATH, { locationIds: disableIds, enabled: false })
      }
      setSavedLocations(locations)
      toast.success(t("updated", { count: changedCount }))
    } catch {
      toast.error(t("update_error"))
      try {
        const fresh = await getJson<LocationSetting[]>(API_PATH)
        setSavedLocations(fresh)
        setLocations(fresh)
      } catch {
        setLocations(savedLocations)
      }
    } finally {
      setSaving(false)
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
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
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
              placeholder={t("search")}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">
              {t("enabled_count", { enabled: enabledCount, total: locations.length })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || saving || locations.length === 0}
              onClick={() => setDraftLocations(locations.map((location) => location.id), true)}
            >
              {t("check_all")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || saving || locations.length === 0}
              onClick={() => setDraftLocations(locations.map((location) => location.id), false)}
            >
              {t("uncheck_all")}
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(10rem,0.6fr)_6rem] gap-3 border-b bg-muted/50 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>{t("location")}</span>
            <span>{t("sensor")}</span>
            <span className="text-center">{t("active")}</span>
          </div>
          <ScrollArea className="h-[28rem]">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">{t("empty")}</div>
            ) : (
              <div className="divide-y">
                {filteredLocations.map((location) => (
                  <label
                    key={location.id}
                    className="grid cursor-pointer grid-cols-[minmax(0,1fr)_minmax(10rem,0.6fr)_6rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate font-medium">{location.name}</span>
                    <span className="min-w-0 truncate text-sm text-muted-foreground">
                      {location.sensorSerial ?? t("unassigned")}
                    </span>
                    <span className="flex justify-center">
                      <Checkbox
                        checked={location.enabled}
                        disabled={saving}
                        onCheckedChange={(checked) => setDraftLocations([location.id], checked === true)}
                        aria-label={t("aria", { location: location.name })}
                      />
                    </span>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <p className="text-xs text-muted-foreground">{t("helper")}</p>

        {hasChanges ? (
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setLocations(savedLocations)} disabled={saving}>
              {tAdmin("pending_changes.cancel")}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {tAdmin("pending_changes.save")}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
