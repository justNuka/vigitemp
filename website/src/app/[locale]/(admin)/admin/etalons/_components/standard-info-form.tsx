'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Combobox } from '@/components/ui/combobox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Module } from '@/hooks/useModules'
import type { StandardType } from '@/hooks/useStandardTypes'

type StandardInfoFormProps = {
  isEditing: boolean
  types: StandardType[] | undefined
  typesLoading: boolean
  modules: Module[] | undefined
  modulesLoading: boolean
}

export function StandardInfoForm({
  isEditing,
  types,
  typesLoading,
  modules,
  modulesLoading,
}: StandardInfoFormProps) {
  const t = useTranslations('standardsPage.form')
  const { control, getValues } = useFormContext()
  const typeCode = useWatch({ control, name: 'type' }) ?? ''
  const portSerie = useWatch({ control, name: 'portSerie' }) ?? getValues('portSerie') ?? ''
  const idWorker = useWatch({ control, name: 'idWorker' }) ?? getValues('idWorker') ?? ''

  const selectedType = useMemo(
    () => types?.find((type) => (type.Type_Etalon ?? '').toUpperCase() === String(typeCode).toUpperCase()) ?? null,
    [typeCode, types],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 lg:col-span-2">
        <h3 className="text-lg font-semibold">{t('sensorSection')}</h3>
      </div>

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.type.label')}</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange} disabled={isEditing}>
              <FormControl>
                <SelectTrigger disabled={typesLoading || isEditing}>
                  <SelectValue placeholder={t('fields.type.placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {types?.map((type) => (
                  <SelectItem key={type.Type_Etalon} value={type.Type_Etalon || ''}>
                    {type.Type_Etalon} - {type.Nom || '-'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="serie"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.serial.label')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('fields.serial.placeholder')}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                readOnly={isEditing}
                className={isEditing ? 'bg-muted opacity-50' : ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="moduleId"
        render={({ field }) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>{t('fields.module.label')}</FormLabel>
            <FormControl>
              <Combobox
                triggerId="module"
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={modulesLoading}
                placeholder={t('fields.module.placeholder')}
                searchPlaceholder={t('fields.module.searchPlaceholder')}
                emptyMessage={t('fields.module.empty')}
                options={(modules ?? []).map((module) => ({
                  value: String(module.Id_Module),
                  label: `${module.Module_Numero_Serie || module.Libelle_Type_Module || module.Id_Module} - port ${module.Port_Serie || 'N/A'} (${module.Emplacement || '-'})`,
                  searchText: `${module.Module_Numero_Serie || ''} ${module.Libelle_Type_Module || ''} ${module.Port_Serie || ''} ${module.Emplacement || ''}`,
                }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>{t('fields.port.label')}</FormLabel>
        <FormControl>
          <Input value={portSerie} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>{t('fields.worker.label')}</FormLabel>
        <FormControl>
          <Input value={idWorker} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:col-span-2">
        {t.rich('coefficientsHint', {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </div>

      {selectedType?.Est_Sonde_Externe ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 lg:col-span-2">
          {t('externalHint')}
        </div>
      ) : null}

      <FormField
        control={control}
        name="coeffA"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.coeffA.label')}</FormLabel>
            <FormControl>
              <Input inputMode="decimal" placeholder={t('fields.coeffA.placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="coeffB"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.coeffB.label')}</FormLabel>
            <FormControl>
              <Input inputMode="decimal" placeholder={t('fields.coeffB.placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="coeffC"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.coeffC.label')}</FormLabel>
            <FormControl>
              <Input inputMode="decimal" placeholder={t('fields.coeffC.placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="incertitudeMax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.maxUncertainty.label')}</FormLabel>
            <FormControl>
              <Input inputMode="decimal" placeholder={t('fields.maxUncertainty.placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
