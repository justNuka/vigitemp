'use client'

import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

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
        <h3 className="text-lg font-semibold">Sonde etalon</h3>
      </div>

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de sonde etalon</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange} disabled={isEditing}>
              <FormControl>
                <SelectTrigger disabled={typesLoading || isEditing}>
                  <SelectValue placeholder="Selectionner un type" />
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
            <FormLabel>Numero de serie</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: SPET-26000001"
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
            <FormLabel>Module</FormLabel>
            <FormControl>
              <Combobox
                triggerId="module"
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={modulesLoading}
                placeholder="Selectionner un module"
                searchPlaceholder="Rechercher un module"
                emptyMessage="Aucun module"
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
        <FormLabel>Port serie</FormLabel>
        <FormControl>
          <Input value={portSerie} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Id worker</FormLabel>
        <FormControl>
          <Input value={idWorker} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:col-span-2">
        Les coefficients <strong>a</strong>, <strong>b</strong>, <strong>c</strong> et l&apos;incertitude max sont disponibles sur le certificat fourni avec la sonde etalon. Verifiez ces valeurs avant validation.
      </div>

      {selectedType?.Est_Sonde_Externe ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 lg:col-span-2">
          Cette sonde est de type externe. Les modules d&apos;ajustage et d&apos;etalonnage ne seront pas disponibles pour ce type de sonde.
        </div>
      ) : null}

      <FormField
        control={control}
        name="coeffA"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Coefficient a</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 0.0001" {...field} />
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
            <FormLabel>Coefficient b</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 1.002" {...field} />
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
            <FormLabel>Coefficient c</FormLabel>
            <FormControl>
              <Input placeholder="Ex: -0.02" {...field} />
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
            <FormLabel>Incertitude max</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 0.05" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
