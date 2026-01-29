'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const UNIT_OPTIONS = [
  { value: 'degres', label: '°C' },
  { value: 'pascal', label: 'Pa' },
  { value: 'co2', label: '%CO2' },
  { value: 'hr', label: '%HR' },
  { value: 'ma', label: 'mA' },
  { value: 'v', label: 'V' },
] as const;

export function StandardCertificateForm() {
  const { control } = useFormContext();
  const t = useTranslations('standardsDialog');

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t('sections.certificate')}</h3>

      <FormField
        control={control}
        name="organisme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.organism_label')}</FormLabel>
            <FormControl>
              <Input id="organisme" placeholder={t('fields.organism_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="dateCertif"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.certificate_date_label')}</FormLabel>
            <FormControl>
              <Input id="date-certif" type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="unite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.unit_label')}</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger id="unite">
                  <SelectValue placeholder={t('fields.unit_placeholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
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
        name="numeroCertif"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('fields.certificate_number_label')}</FormLabel>
            <FormControl>
              <Input id="num-certif" placeholder={t('fields.certificate_number_placeholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

