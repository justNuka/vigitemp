'use client'

import type { Dispatch, SetStateAction } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TabsContent } from '@/components/ui/tabs'

import type { LocationFormData } from './location-form-types'

type Props = {
  formData: LocationFormData
  setFormData: Dispatch<SetStateAction<LocationFormData>>
}

export function LocationFormTabMetrology({ formData, setFormData }: Props) {
  return (
    <TabsContent value="metrologie" className="space-y-6">
      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">Sonde</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Numéro de série</Label>
            <Input disabled value={formData.Sonde_Numero_Serie || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>État</Label>
            <Input disabled placeholder="Automatique" className="bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date de calibrage</Label>
            <Input disabled placeholder="Automatique" className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Date d'étalonnage</Label>
            <Input disabled placeholder="Automatique" className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Unité</Label>
            <Input disabled value={formData.Unite || '°C'} className="bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Erreur de justesse</Label>
            <Input type="number" step="0.01" disabled value={formData.Erreur_Justesse || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Incertitude</Label>
            <Input type="number" step="0.01" disabled value={formData.Incertitude || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Dérive</Label>
            <Input type="number" step="0.01" disabled value={formData.Derive || ''} className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="border p-3 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900/30">
        <h3 className="font-semibold text-sm">Consignes</h3>
        <div className="space-y-2 text-sm">
          {formData.Est_Consigne_Sup_Active && (
            <div className="flex justify-between items-center">
              <span>Consigne sup. ({formData.Consigne_Sup || '-'})</span>
              <span className="text-muted-foreground">Tolérance de surveillance supérieure</span>
              <Input
                type="number"
                step="0.01"
                value={formData.Tolerance_Surveillance_Sup || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Tolerance_Surveillance_Sup: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="0.00"
                className="w-24 h-8"
              />
            </div>
          )}
          {formData.Est_Consigne_Inf_Active && (
            <div className="flex justify-between items-center">
              <span>Consigne inf. ({formData.Consigne_Inf || '-'})</span>
              <span className="text-muted-foreground">Tolérance de surveillance inférieure</span>
              <Input
                type="number"
                step="0.01"
                value={formData.Tolerance_Surveillance_Inf || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Tolerance_Surveillance_Inf: parseFloat(e.target.value) || undefined,
                  })
                }
                placeholder="0.00"
                className="w-24 h-8"
              />
            </div>
          )}
          {!formData.Est_Consigne_Sup_Active && !formData.Est_Consigne_Inf_Active && (
            <p className="text-muted-foreground">Aucune consigne configurée</p>
          )}
        </div>
      </div>

      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">EMT (Erreur Maximale Tolérée)</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="quart"
              checked={formData.EMT_Mode === 'quart'}
              onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Les EMT obéissent à la règle du quart</div>
              <div className="text-sm text-muted-foreground">
                L'EMT de la sonde de surveillance est fixée par défaut au quart de l'EMT
              </div>
              {formData.EMT_Mode === 'quart' && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Nombre à 2 décimales"
                    value={formData.EMT_Valeur || ''}
                    onChange={(e) => setFormData({ ...formData, EMT_Valeur: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="manuel"
              checked={formData.EMT_Mode === 'manuel'}
              onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
              className="mt-1"
            />
            <div>
              <div className="font-medium">EMT saisie manuellement</div>
              <div className="text-sm text-muted-foreground">
                En saisie manuelle, l'EMT de la sonde de surveillance doit être inférieur ou égal au quart de l'EMT de
                l'équipement
              </div>
              {formData.EMT_Mode === 'manuel' && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Nombre à 2 décimales"
                    value={formData.EMT_Valeur || ''}
                    onChange={(e) => setFormData({ ...formData, EMT_Valeur: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="uncertainties"
              checked={formData.EMT_Mode === 'uncertainties'}
              onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
              className="mt-1"
            />
            <div>
              <div className="font-medium">Avec prise en compte des incertitudes d'utilisation</div>
              <div className="text-sm text-muted-foreground">
                Les incertitudes d'utilisation sont calculées lors de l'étalonnage de la sonde utilisée, elles diffèrent pour
                chaque sonde
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="sans-objet"
              checked={formData.EMT_Mode === 'sans-objet'}
              onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
              className="mt-1"
            />
            <div className="font-medium">Sans objet</div>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.Corriger_Erreur_Justesse || false}
            onCheckedChange={(checked) => setFormData({ ...formData, Corriger_Erreur_Justesse: !!checked })}
          />
          <span>Corriger l'erreur de justesse</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.Prendre_En_Compte_Derive ?? true}
            onCheckedChange={(checked) => setFormData({ ...formData, Prendre_En_Compte_Derive: !!checked })}
          />
          <span>Prendre en compte la dérive dans l'incertitude</span>
        </label>
      </div>
    </TabsContent>
  )
}

