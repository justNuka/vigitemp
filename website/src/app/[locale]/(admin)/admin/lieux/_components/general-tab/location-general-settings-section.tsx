'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { MultiSelectFilter } from '@/components/multi-select-filter'
import type { Group } from '@/hooks/useGroups'
import type { SiteSimple } from '@/hooks/useSites'

import type { LocationFormData } from '../location-form-types'
import { QuickCreateGroupButton, QuickCreateSiteButton } from './location-quick-create-buttons'

export function LocationGeneralSettingsSection({ sites, groups }: { sites: SiteSimple[]; groups: Group[] }) {
  const t = useTranslations('locationsForm.general')
  const { control, setValue, watch, formState: { errors } } = useFormContext<LocationFormData>()
  const formData = watch()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>{t('labels.site')}</Label>
            <QuickCreateSiteButton />
          </div>
          <Controller
            control={control}
            name="Id_Site"
            render={({ field }) => (
              <Combobox
                triggerId="site"
                value={field.value ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(val ? parseInt(val, 10) : null)}
                placeholder={t('placeholders.site')}
                searchPlaceholder={t('placeholders.site_search')}
                emptyMessage={t('placeholders.site_empty')}
                options={sites.map((site) => ({ value: site.id.toString(), label: site.name, searchText: site.name }))}
              />
            )}
          />
          {errors.Id_Site?.message ? <p className="text-sm text-destructive">{String(errors.Id_Site.message)}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>{t('labels.groups')}</Label>
            <QuickCreateGroupButton />
          </div>
          <Controller
            control={control}
            name="GroupIds"
            render={({ field }) => (
              <MultiSelectFilter
                label={t('labels.groups')}
                options={groups.map((group) => ({
                  id: group.Id_Groupe,
                  label: group.Nom_Groupe || t('group_fallback', { id: group.Id_Groupe }),
                }))}
                selectedIds={field.value || []}
                onChange={(selectedIds) => field.onChange(selectedIds.map((value) => Number(value)).filter((value) => !Number.isNaN(value)))}
                placeholder={t('placeholders.groups')}
                tone="default"
                enableSearch
                searchPlaceholder={t('placeholders.groups_search')}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('labels.alarm_sound')}</Label>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Checkbox
            checked={formData.Est_Son_Alarme_Active ?? true}
            onCheckedChange={(checked) => setValue('Est_Son_Alarme_Active', !!checked, { shouldDirty: true })}
          />
          <Label className="font-normal">{t('labels.alarm_sound_enable')}</Label>
        </div>
      </div>
    </div>
  )
}
