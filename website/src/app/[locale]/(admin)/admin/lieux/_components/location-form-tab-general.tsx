'use client'

import type { Dispatch, SetStateAction } from 'react'

import type { AvailableProbe } from '@/hooks/useAvailableProbes'
import type { Group } from '@/hooks/useGroups'
import type { SiteSimple } from '@/hooks/useSites'
import { MultiSelectFilter } from '@/components/multi-select-filter'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'

import type { LocationFormData } from './location-form-types'

type Props = {
  formData: LocationFormData
  setFormData: Dispatch<SetStateAction<LocationFormData>>
  sites: SiteSimple[]
  groups: Group[]
  availableProbes: AvailableProbe[]
}

export function LocationFormTabGeneral({ formData, setFormData, sites, groups, availableProbes }: Props) {
  return (
    <TabsContent value="general" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom du lieu</Label>
          <Input
            value={formData.Nom_Lieu || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Lieu: e.target.value })}
            placeholder="Ex: Stockage A"
          />
        </div>
        <div className="space-y-2">
          <Label>Type de lieu</Label>
          <Select value={formData.Type_Lieu || ''} onValueChange={(val) => setFormData({ ...formData, Type_Lieu: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="etuve">Étuve</SelectItem>
              <SelectItem value="bain_marie">Bain Marie</SelectItem>
              <SelectItem value="ambiance">Ambiance</SelectItem>
              <SelectItem value="frigo_congel">Frigo/Congel</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Observations / Commentaires</Label>
          <Input
            value={formData.Lieu_Etat || ''}
            onChange={(e) => setFormData({ ...formData, Lieu_Etat: e.target.value })}
            placeholder="Notes..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Site</Label>
          <Select
            value={formData.Id_Site?.toString() || ''}
            onValueChange={(val) => setFormData({ ...formData, Id_Site: val ? parseInt(val) : null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un site" />
            </SelectTrigger>
            <SelectContent>
              {sites?.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Groupe(s)</Label>
          <MultiSelectFilter
            label="Groupes"
            options={(groups || []).map((g) => ({
              id: g.Id_Groupe,
              label: g.Nom_Groupe || `Groupe ${g.Id_Groupe}`,
            }))}
            selectedIds={formData.GroupIds || []}
            onChange={(selectedIds) =>
              setFormData({
                ...formData,
                GroupIds: selectedIds.map((v) => Number(v)).filter((v) => !Number.isNaN(v)),
              })
            }
            placeholder="Sélectionner..."
          />
        </div>
      </div>

      <div className="border p-4 rounded-lg space-y-4 mt-6">
        <h3 className="font-semibold">Sonde</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sélection de sonde</Label>
            <Select
              value={formData.Sonde_Numero_Serie || ''}
              onValueChange={(val) => setFormData({ ...formData, Sonde_Numero_Serie: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une sonde" />
              </SelectTrigger>
              <SelectContent>
                {availableProbes?.map((probe) => (
                  <SelectItem key={probe.Sonde_Numero_Serie} value={probe.Sonde_Numero_Serie || ''}>
                    {probe.Sonde_Numero_Serie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>État de la sonde</Label>
            <Input disabled placeholder="Automatique" className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="border p-4 rounded-lg space-y-4 mt-6">
        <h3 className="font-semibold">Consignes</h3>
        <div className="space-y-4">
          <div className="space-y-3 pb-3 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consigne</Label>
                <Input
                  type="number"
                  value={formData.Consigne || ''}
                  onChange={(e) => setFormData({ ...formData, Consigne: parseFloat(e.target.value) || undefined })}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Fréquence de mesure (min)</Label>
                <Input
                  type="number"
                  value={formData.Frequence || ''}
                  onChange={(e) => setFormData({ ...formData, Frequence: parseInt(e.target.value) || undefined })}
                  placeholder="15"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.Est_Consigne_Sup_Active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, Est_Consigne_Sup_Active: !!checked })}
              />
              <Label className="font-medium">Activation consigne sup</Label>
            </div>
            {formData.Est_Consigne_Sup_Active && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum</Label>
                    <Input
                      type="number"
                      value={formData.Consigne_Sup || ''}
                      onChange={(e) => setFormData({ ...formData, Consigne_Sup: parseFloat(e.target.value) || undefined })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retard d'alarme (mn)</Label>
                    <Input
                      type="number"
                      value={formData.Retard_Alarme_Haut || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, Retard_Alarme_Haut: parseInt(e.target.value) || undefined })
                      }
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, Est_Consigne_Sup_Pre_Alarme_Active: !!checked })
                    }
                  />
                  <Label>Activation consigne sup pré-alarme</Label>
                </div>
                {formData.Est_Consigne_Sup_Pre_Alarme_Active && (
                  <div className="space-y-2 pl-6">
                    <Label>Pré-alarme sup.</Label>
                    <Input
                      type="number"
                      value={formData.Consigne_Sup_Pre_Alarme || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Consigne_Sup_Pre_Alarme: parseFloat(e.target.value) || undefined,
                        })
                      }
                      placeholder="0.0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.Est_Consigne_Inf_Active || false}
                onCheckedChange={(checked) => setFormData({ ...formData, Est_Consigne_Inf_Active: !!checked })}
              />
              <Label className="font-medium">Activation consigne inf</Label>
            </div>
            {formData.Est_Consigne_Inf_Active && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum</Label>
                    <Input
                      type="number"
                      value={formData.Consigne_Inf || ''}
                      onChange={(e) => setFormData({ ...formData, Consigne_Inf: parseFloat(e.target.value) || undefined })}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retard d'alarme (mn)</Label>
                    <Input
                      type="number"
                      value={formData.Retard_Alarme_Bas || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, Retard_Alarme_Bas: parseInt(e.target.value) || undefined })
                      }
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, Est_Consigne_Inf_Pre_Alarme_Active: !!checked })
                    }
                  />
                  <Label>Activation consigne inf pré-alarme</Label>
                </div>
                {formData.Est_Consigne_Inf_Pre_Alarme_Active && (
                  <div className="space-y-2 pl-6">
                    <Label>Pré-alarme inf.</Label>
                    <Input
                      type="number"
                      value={formData.Consigne_Inf_Pre_Alarme || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Consigne_Inf_Pre_Alarme: parseFloat(e.target.value) || undefined,
                        })
                      }
                      placeholder="0.0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

