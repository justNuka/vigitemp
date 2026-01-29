'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import type { StandardType } from '@/hooks/useStandardTypes';
import type { Module } from '@/hooks/useModules';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type StandardInfoFormProps = {
  isEditing: boolean;
  types: StandardType[] | undefined;
  typesLoading: boolean;
  modules: Module[] | undefined;
  modulesLoading: boolean;
};

export function StandardInfoForm({
  isEditing,
  types,
  typesLoading,
  modules,
  modulesLoading,
}: StandardInfoFormProps) {
  const { control, getValues } = useFormContext();
  const portSerie = useWatch({ control, name: 'portSerie' }) ?? getValues('portSerie') ?? '';
  const idServeur = useWatch({ control, name: 'idServeur' }) ?? getValues('idServeur') ?? '0';
  const t = useTranslations('standardsDialog');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('sections.info')}</h3>

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.type_label')}</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange} disabled={isEditing}>
              <FormControl>
                <SelectTrigger id="type" disabled={typesLoading || isEditing}>
                  <SelectValue placeholder={t('fields.type_placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t.Type_Etalon} value={t.Type_Etalon || ''}>
                    {t.Type_Etalon} - {t.Nom || '-'}
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
            <FormLabel>{t('fields.serial_label')}</FormLabel>
            <FormControl>
              <Input
                id="serie"
                placeholder={t('fields.serial_placeholder')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
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
          <FormItem>
            <FormLabel>{t('fields.module_label')}</FormLabel>
            <FormControl>
              <Combobox
                triggerId="module"
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={modulesLoading}
                placeholder={t('fields.module_placeholder')}
                searchPlaceholder={t('fields.module_search_placeholder')}
                emptyMessage={t('fields.module_empty')}
                options={(modules ?? []).map((mod) => ({
                  value: mod.Id_Module.toString(),
                  label: `${mod.Module_Numero_Serie || mod.Libelle_Type_Module || mod.Id_Module} sur port ${
                    mod.Port_Serie || 'N/A'
                  } (${mod.Emplacement || '-'})`,
                  searchText: `${mod.Module_Numero_Serie || ''} ${mod.Libelle_Type_Module || ''} ${
                    mod.Port_Serie || ''
                  } ${mod.Emplacement || ''} ${mod.Id_Module}`,
                }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>{t('fields.port_label')}</FormLabel>
        <FormControl>
          <Input id="port" placeholder={t('fields.port_placeholder')} value={portSerie} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>{t('fields.server_id_label')}</FormLabel>
        <FormControl>
          <Input id="server" placeholder={t('fields.server_id_placeholder')} value={idServeur} readOnly className="bg-muted opacity-50" />
        </FormControl>
      </FormItem>

      <FormField
        control={control}
        name="valeurBase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.base_value_label')}</FormLabel>
            <FormControl>
              <Input id="base-value" type="number" placeholder={t('fields.number_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="resolution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.resolution_label')}</FormLabel>
            <FormControl>
              <Input id="resolution" type="number" placeholder={t('fields.number_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="incertitude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.incertitude_label')}</FormLabel>
            <FormControl>
              <Input id="incertitude" type="number" placeholder={t('fields.number_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
