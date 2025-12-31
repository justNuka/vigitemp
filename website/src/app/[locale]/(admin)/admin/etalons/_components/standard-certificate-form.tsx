'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const UNIT_OPTIONS = [
  { value: 'degres', label: '°C' },
  { value: 'pascal', label: 'Pa' },
  { value: 'co2', label: '%CO2' },
  { value: 'hr', label: '%HR' },
  { value: 'ma', label: 'mA' },
  { value: 'v', label: 'V' },
] as const;

type StandardCertificateFormProps = {
  organisme: string;
  setOrganisme: (value: string) => void;
  dateCertif: string;
  setDateCertif: (value: string) => void;
  unite: string;
  setUnite: (value: string) => void;
  numeroCertif: string;
  setNumeroCertif: (value: string) => void;
};

export function StandardCertificateForm({
  organisme,
  setOrganisme,
  dateCertif,
  setDateCertif,
  unite,
  setUnite,
  numeroCertif,
  setNumeroCertif,
}: StandardCertificateFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Certificat</h3>

      <div className="space-y-2">
        <Label htmlFor="organisme">Organisme</Label>
        <Input
          id="organisme"
          placeholder="Nom de l'organisme"
          value={organisme}
          onChange={(e) => setOrganisme(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-certif">Date certificat</Label>
        <Input
          id="date-certif"
          type="date"
          value={dateCertif}
          onChange={(e) => setDateCertif(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unite">Unité</Label>
        <Select value={unite} onValueChange={setUnite}>
          <SelectTrigger id="unite">
            <SelectValue placeholder="Sélectionner une unité" />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="num-certif">Numéro de certificat</Label>
        <Input
          id="num-certif"
          placeholder="Numéro de certificat"
          value={numeroCertif}
          onChange={(e) => setNumeroCertif(e.target.value)}
        />
      </div>
    </div>
  );
}

