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
import { Combobox } from '@/components/ui/combobox';
import type { StandardType } from '@/hooks/useStandardTypes';
import type { Module } from '@/hooks/useModules';

type StandardInfoFormProps = {
  isEditing: boolean;
  types: StandardType[] | undefined;
  typesLoading: boolean;
  modules: Module[] | undefined;
  modulesLoading: boolean;

  type: string;
  setType: (value: string) => void;
  serie: string;
  setSerie: (value: string) => void;
  moduleId: string;
  setModuleId: (value: string) => void;
  portSerie: string;
  idServeur: string;
  valeurBase: string;
  setValeurBase: (value: string) => void;
  resolution: string;
  setResolution: (value: string) => void;
  incertitude: string;
  setIncertitude: (value: string) => void;
};

export function StandardInfoForm({
  isEditing,
  types,
  typesLoading,
  modules,
  modulesLoading,
  type,
  setType,
  serie,
  setSerie,
  moduleId,
  setModuleId,
  portSerie,
  idServeur,
  valeurBase,
  setValeurBase,
  resolution,
  setResolution,
  incertitude,
  setIncertitude,
}: StandardInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Informations de l'étalon</h3>

      <div className="space-y-2">
        <Label htmlFor="type">Type d'étalon</Label>
        <Select value={type} onValueChange={setType} disabled={isEditing}>
          <SelectTrigger id="type" disabled={typesLoading || isEditing}>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {types?.map((t) => (
              <SelectItem key={t.Type_Etalon} value={t.Type_Etalon || ''}>
                {t.Type_Etalon} - {t.Nom || '-'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serie">Numéro de série</Label>
        <Input
          id="serie"
          placeholder="Ex: 00001"
          value={serie}
          onChange={(e) => setSerie(e.target.value.replace(/\D/g, ''))}
          readOnly={isEditing}
          className={isEditing ? 'bg-muted opacity-50' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="module">Module</Label>
        <Combobox
          triggerId="module"
          value={moduleId}
          onValueChange={setModuleId}
          disabled={modulesLoading}
          placeholder="Sélectionner un module"
          searchPlaceholder="Rechercher un module..."
          emptyMessage="Aucun module"
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="port">Port série</Label>
        <Input id="port" placeholder="Port série" value={portSerie} readOnly className="bg-muted opacity-50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="server">ID Serveur</Label>
        <Input id="server" placeholder="ID Serveur" value={idServeur} readOnly className="bg-muted opacity-50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="base-value">Valeur de base</Label>
        <Input
          id="base-value"
          type="number"
          placeholder="0"
          value={valeurBase}
          onChange={(e) => setValeurBase(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resolution">Résolution</Label>
        <Input
          id="resolution"
          type="number"
          placeholder="0"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="incertitude">Incertitude</Label>
        <Input
          id="incertitude"
          type="number"
          placeholder="0"
          value={incertitude}
          onChange={(e) => setIncertitude(e.target.value)}
        />
      </div>
    </div>
  );
}
