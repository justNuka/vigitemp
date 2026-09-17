'use client'

import { useMemo, useState } from 'react'
import { Copy, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { LocationRow } from '@/hooks/useLocations'
import { formatNumber } from '@/lib/number-display'

interface LocationConfigSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: LocationRow[]
  onSelect: (location: LocationRow) => void
}

export function LocationConfigSourceDialog({
  open,
  onOpenChange,
  locations,
  onSelect,
}: LocationConfigSourceDialogProps) {
  const t = useTranslations('locationConfigCopy')
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
  const [search, setSearch] = useState('')

  const filteredLocations = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(localeTag)
    return locations
      .filter((location) => !location.Est_Archive)
      .filter((location) => {
        if (!term) return true
        const groups = location.t_lieu_groupe
          ?.map((entry) => entry.t_groupe?.Nom_Groupe ?? entry.t_groupe?.Numero_Regroupement ?? '')
          .join(' ') ?? ''
        const haystack = [
          location.Nom_Lieu,
          location.t_site?.Libelle_Site,
          location.Sonde_Numero_Serie,
          groups,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase(localeTag)
        return haystack.includes(term)
      })
  }, [localeTag, locations, search])

  const formatValue = (value: number | null | undefined) =>
    formatNumber(value, {
      minimumDecimals: 0,
      maximumDecimals: 3,
      locale: localeTag,
      fallback: t('summary.none'),
    })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setSearch('')
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white p-0 dark:bg-card">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('search_placeholder')}
              className="pl-9"
            />
          </div>

          <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
            {filteredLocations.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t('empty')}
              </div>
            ) : (
              filteredLocations.map((location) => {
                const groupNames = (location.t_lieu_groupe ?? [])
                  .map((entry) => entry.t_groupe?.Nom_Groupe ?? entry.t_groupe?.Numero_Regroupement ?? '')
                  .filter(Boolean)
                const high = location.Est_Consigne_Sup_Active ? formatValue(location.Consigne_Sup) : t('summary.none')
                const low = location.Est_Consigne_Inf_Active ? formatValue(location.Consigne_Inf) : t('summary.none')
                const contactsCount = location.MailingContacts?.length ?? 0

                return (
                  <button
                    key={location.Id_Lieu}
                    type="button"
                    onClick={() => onSelect(location)}
                    className="w-full rounded-lg border border-border/70 bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-semibold">{location.Nom_Lieu || t('summary.unnamed')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('summary.site')}: {location.t_site?.Libelle_Site || t('summary.none')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('summary.sensor')}: {location.Sonde_Numero_Serie || t('summary.no_sensor')}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('select')}
                      </span>
                    </div>

                    {groupNames.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {groupNames.slice(0, 4).map((groupName) => (
                          <Badge key={groupName} variant="secondary" className="font-normal">
                            {groupName}
                          </Badge>
                        ))}
                        {groupNames.length > 4 ? (
                          <Badge variant="outline">{t('summary.more_groups', { count: groupNames.length - 4 })}</Badge>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>
                        <span className="font-medium text-foreground">{t('summary.setpoint')}</span>{' '}
                        {formatValue(location.Consigne)}
                      </span>
                      <span>
                        <span className="font-medium text-foreground">{t('summary.range')}</span>{' '}
                        {t('summary.range_value', { low, high })}
                      </span>
                      <span>
                        <span className="font-medium text-foreground">{t('summary.frequency')}</span>{' '}
                        {t('summary.frequency_value', { value: formatValue(location.Frequence) })}
                      </span>
                      <span>
                        <span className="font-medium text-foreground">{t('summary.contacts')}</span>{' '}
                        {contactsCount}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
