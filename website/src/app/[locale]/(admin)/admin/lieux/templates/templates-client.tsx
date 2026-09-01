'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Archive, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { fadeInUp } from '@/lib/motion-variants'
import { useLocationTemplates, type LocationTemplateRow } from '@/hooks/useLocationTemplates'
import { postJson, patchJson, deleteJson } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type TemplateFormState = {
  Nom_Template: string
  Description: string
  Lieu_Etat: string
  Frequence: string
  Consigne: string
  Consigne_Sup: string
  Consigne_Inf: string
  Retard_Alarme_Haut: string
  Retard_Alarme_Bas: string
  Retard_Non_Reponse: string
  Retard_Alarme_Changement_Consigne: string
  Est_Consigne_Sup_Active: boolean
  Est_Consigne_Inf_Active: boolean
  Est_Consigne_Sup_Pre_Alarme_Active: boolean
  Est_Consigne_Inf_Pre_Alarme_Active: boolean
  Est_Son_Alarme_Active: boolean
  Est_Redeclenchement_Immediat: boolean
  Nb_Mesures_Temporisation_Redeclenchement: string
  Observations_Info: string
}

const EMPTY_FORM: TemplateFormState = {
  Nom_Template: '',
  Description: '',
  Lieu_Etat: 'D',
  Frequence: '',
  Consigne: '',
  Consigne_Sup: '',
  Consigne_Inf: '',
  Retard_Alarme_Haut: '',
  Retard_Alarme_Bas: '',
  Retard_Non_Reponse: '',
  Retard_Alarme_Changement_Consigne: '',
  Est_Consigne_Sup_Active: false,
  Est_Consigne_Inf_Active: false,
  Est_Consigne_Sup_Pre_Alarme_Active: false,
  Est_Consigne_Inf_Pre_Alarme_Active: false,
  Est_Son_Alarme_Active: true,
  Est_Redeclenchement_Immediat: false,
  Nb_Mesures_Temporisation_Redeclenchement: '0',
  Observations_Info: '',
}

const toNullableNumber = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function toFormState(template: LocationTemplateRow): TemplateFormState {
  return {
    Nom_Template: template.Nom_Template ?? '',
    Description: template.Description ?? '',
    Lieu_Etat: template.Lieu_Etat ?? 'D',
    Frequence: template.Frequence == null ? '' : String(template.Frequence),
    Consigne: template.Consigne == null ? '' : String(template.Consigne),
    Consigne_Sup: template.Consigne_Sup == null ? '' : String(template.Consigne_Sup),
    Consigne_Inf: template.Consigne_Inf == null ? '' : String(template.Consigne_Inf),
    Retard_Alarme_Haut: template.Retard_Alarme_Haut == null ? '' : String(template.Retard_Alarme_Haut),
    Retard_Alarme_Bas: template.Retard_Alarme_Bas == null ? '' : String(template.Retard_Alarme_Bas),
    Retard_Non_Reponse: template.Retard_Non_Reponse == null ? '' : String(template.Retard_Non_Reponse),
    Retard_Alarme_Changement_Consigne: template.Retard_Alarme_Changement_Consigne == null ? '' : String(template.Retard_Alarme_Changement_Consigne),
    Est_Consigne_Sup_Active: !!template.Est_Consigne_Sup_Active,
    Est_Consigne_Inf_Active: !!template.Est_Consigne_Inf_Active,
    Est_Consigne_Sup_Pre_Alarme_Active: !!template.Est_Consigne_Sup_Pre_Alarme_Active,
    Est_Consigne_Inf_Pre_Alarme_Active: !!template.Est_Consigne_Inf_Pre_Alarme_Active,
    Est_Son_Alarme_Active: template.Est_Son_Alarme_Active ?? true,
    Est_Redeclenchement_Immediat: !!template.Est_Redeclenchement_Immediat,
    Nb_Mesures_Temporisation_Redeclenchement: template.Nb_Mesures_Temporisation_Redeclenchement == null ? '0' : String(template.Nb_Mesures_Temporisation_Redeclenchement),
    Observations_Info: template.Observations_Info ?? '',
  }
}

function toPayload(form: TemplateFormState) {
  return {
    Nom_Template: form.Nom_Template.trim(),
    Description: form.Description.trim() || null,
    Lieu_Etat: form.Lieu_Etat || 'D',
    Frequence: toNullableNumber(form.Frequence),
    Consigne: toNullableNumber(form.Consigne),
    Consigne_Sup: toNullableNumber(form.Consigne_Sup),
    Consigne_Inf: toNullableNumber(form.Consigne_Inf),
    Retard_Alarme_Haut: toNullableNumber(form.Retard_Alarme_Haut),
    Retard_Alarme_Bas: toNullableNumber(form.Retard_Alarme_Bas),
    Retard_Non_Reponse: toNullableNumber(form.Retard_Non_Reponse),
    Retard_Alarme_Changement_Consigne: toNullableNumber(form.Retard_Alarme_Changement_Consigne),
    Est_Consigne_Sup_Active: form.Est_Consigne_Sup_Active,
    Est_Consigne_Inf_Active: form.Est_Consigne_Inf_Active,
    Est_Consigne_Sup_Pre_Alarme_Active: form.Est_Consigne_Sup_Pre_Alarme_Active,
    Est_Consigne_Inf_Pre_Alarme_Active: form.Est_Consigne_Inf_Pre_Alarme_Active,
    Est_Son_Alarme_Active: form.Est_Son_Alarme_Active,
    Est_Redeclenchement_Immediat: form.Est_Redeclenchement_Immediat,
    Nb_Mesures_Temporisation_Redeclenchement: toNullableNumber(form.Nb_Mesures_Temporisation_Redeclenchement) ?? 0,
    Observations_Info: form.Observations_Info.trim() || null,
  }
}

export function LocationTemplatesClient() {
  const t = useTranslations('locationTemplatesPage')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const [statusTab, setStatusTab] = useState<'active' | 'archived'>('active')
  const [selectedTemplate, setSelectedTemplate] = useState<LocationTemplateRow | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [form, setForm] = useState<TemplateFormState>(EMPTY_FORM)

  const { data: allTemplates = [], isLoading } = useLocationTemplates(true, 'all')
  const activeTemplates = useMemo(() => allTemplates.filter((item) => !item.Est_Archive), [allTemplates])
  const archivedTemplates = useMemo(() => allTemplates.filter((item) => !!item.Est_Archive), [allTemplates])
  const displayedTemplates = statusTab === 'active' ? activeTemplates : archivedTemplates

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['location-templates'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof toPayload>) => postJson('/api/lieux/templates', payload),
    onSuccess: () => {
      invalidate()
      toast.success(t('toast.create_success'))
      setIsCreateOpen(false)
      setForm(EMPTY_FORM)
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('toast.create_error')),
  })

  const editMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof toPayload>) => {
      if (!selectedTemplate) throw new Error(t('errors.no_template_selected'))
      return patchJson(`/api/lieux/templates/${selectedTemplate.Id_Lieu_Template}`, payload)
    },
    onSuccess: () => {
      invalidate()
      toast.success(t('toast.update_success'))
      setIsEditOpen(false)
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('toast.update_error')),
  })

  const archiveMutation = useMutation({
    mutationFn: () => {
      if (!selectedTemplate) throw new Error(t('errors.no_template_selected'))
      return patchJson(`/api/lieux/templates/${selectedTemplate.Id_Lieu_Template}`, { Est_Archive: true })
    },
    onSuccess: () => {
      invalidate()
      setIsArchiveOpen(false)
      setSelectedTemplate(null)
      toast.success(t('toast.archive_success'))
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('toast.archive_error')),
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedTemplate) throw new Error(t('errors.no_template_selected'))
      return deleteJson(`/api/lieux/templates/${selectedTemplate.Id_Lieu_Template}`)
    },
    onSuccess: () => {
      invalidate()
      setIsDeleteOpen(false)
      setSelectedTemplate(null)
      toast.success(t('toast.delete_success'))
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : t('toast.delete_error')),
  })

  const onCreate = () => {
    const name = form.Nom_Template.trim()
    if (!name) {
      toast.error(t('errors.name_required'))
      return
    }
    createMutation.mutate(toPayload(form))
  }

  const onUpdate = () => {
    const name = form.Nom_Template.trim()
    if (!name) {
      toast.error(t('errors.name_required'))
      return
    }
    editMutation.mutate(toPayload(form))
  }

  const openEdit = () => {
    if (!selectedTemplate) return
    setForm(toFormState(selectedTemplate))
    setIsEditOpen(true)
  }

  const NumberInput = (props: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1">
      <Label>{props.label}</Label>
      <Input value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  )

  const BooleanSwitch = (props: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded border p-2">
      <Label>{props.label}</Label>
      <Switch checked={props.checked} onCheckedChange={props.onChange} />
    </div>
  )

  const renderForm = () => (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1">
        <Label>{t('fields.name')}</Label>
        <Input value={form.Nom_Template} onChange={(e) => setForm((prev) => ({ ...prev, Nom_Template: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <Label>{t('fields.surveillance_state')}</Label>
        <Input value={form.Lieu_Etat} maxLength={1} onChange={(e) => setForm((prev) => ({ ...prev, Lieu_Etat: e.target.value.toUpperCase().slice(0, 1) }))} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>{t('fields.description')}</Label>
        <Textarea rows={2} value={form.Description} onChange={(e) => setForm((prev) => ({ ...prev, Description: e.target.value }))} />
      </div>
      <NumberInput label={t('fields.frequency')} value={form.Frequence} onChange={(v) => setForm((prev) => ({ ...prev, Frequence: v }))} />
      <NumberInput label={t('fields.setpoint')} value={form.Consigne} onChange={(v) => setForm((prev) => ({ ...prev, Consigne: v }))} />
      <NumberInput label={t('fields.upper_setpoint')} value={form.Consigne_Sup} onChange={(v) => setForm((prev) => ({ ...prev, Consigne_Sup: v }))} />
      <NumberInput label={t('fields.lower_setpoint')} value={form.Consigne_Inf} onChange={(v) => setForm((prev) => ({ ...prev, Consigne_Inf: v }))} />
      <NumberInput label={t('fields.high_delay')} value={form.Retard_Alarme_Haut} onChange={(v) => setForm((prev) => ({ ...prev, Retard_Alarme_Haut: v }))} />
      <NumberInput label={t('fields.low_delay')} value={form.Retard_Alarme_Bas} onChange={(v) => setForm((prev) => ({ ...prev, Retard_Alarme_Bas: v }))} />
      <NumberInput label={t('fields.non_response_delay')} value={form.Retard_Non_Reponse} onChange={(v) => setForm((prev) => ({ ...prev, Retard_Non_Reponse: v }))} />
      <NumberInput label={t('fields.setpoint_change_delay')} value={form.Retard_Alarme_Changement_Consigne} onChange={(v) => setForm((prev) => ({ ...prev, Retard_Alarme_Changement_Consigne: v }))} />
      <NumberInput label={t('fields.retrigger_count')} value={form.Nb_Mesures_Temporisation_Redeclenchement} onChange={(v) => setForm((prev) => ({ ...prev, Nb_Mesures_Temporisation_Redeclenchement: v }))} />
      <div className="space-y-1 md:col-span-2">
        <Label>{t('fields.observations')}</Label>
        <Textarea rows={2} value={form.Observations_Info} onChange={(e) => setForm((prev) => ({ ...prev, Observations_Info: e.target.value }))} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <BooleanSwitch label={t('fields.enable_upper')} checked={form.Est_Consigne_Sup_Active} onChange={(v) => setForm((prev) => ({ ...prev, Est_Consigne_Sup_Active: v }))} />
        <BooleanSwitch label={t('fields.enable_lower')} checked={form.Est_Consigne_Inf_Active} onChange={(v) => setForm((prev) => ({ ...prev, Est_Consigne_Inf_Active: v }))} />
        <BooleanSwitch label={t('fields.enable_upper_pre')} checked={form.Est_Consigne_Sup_Pre_Alarme_Active} onChange={(v) => setForm((prev) => ({ ...prev, Est_Consigne_Sup_Pre_Alarme_Active: v }))} />
        <BooleanSwitch label={t('fields.enable_lower_pre')} checked={form.Est_Consigne_Inf_Pre_Alarme_Active} onChange={(v) => setForm((prev) => ({ ...prev, Est_Consigne_Inf_Pre_Alarme_Active: v }))} />
        <BooleanSwitch label={t('fields.alarm_sound')} checked={form.Est_Son_Alarme_Active} onChange={(v) => setForm((prev) => ({ ...prev, Est_Son_Alarme_Active: v }))} />
        <BooleanSwitch label={t('fields.immediate_retrigger')} checked={form.Est_Redeclenchement_Immediat} onChange={(v) => setForm((prev) => ({ ...prev, Est_Redeclenchement_Immediat: v }))} />
      </div>
    </div>
  )

  return (
    <LazyMotion features={domAnimation}>
      <m.main className="flex-1 p-4 md:p-6 space-y-6" variants={fadeInUp} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('count', { count: displayedTemplates.length })}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true) }} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {tCommon('add')}
              </Button>
              <Button onClick={openEdit} variant="outline" size="sm" disabled={!selectedTemplate || statusTab === 'archived'} className="gap-2">
                <Pencil className="h-4 w-4" />
                {tCommon('edit')}
              </Button>
              <Button onClick={() => setIsArchiveOpen(true)} variant="outline" size="sm" disabled={!selectedTemplate || statusTab === 'archived'} className="gap-2">
                <Archive className="h-4 w-4" />
                {t('actions.archive')}
              </Button>
              <Button onClick={() => setIsDeleteOpen(true)} variant="destructive" size="sm" disabled={!selectedTemplate} className="gap-2">
                <Trash2 className="h-4 w-4" />
                {tCommon('delete')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={statusTab} onValueChange={(value) => { setStatusTab(value as 'active' | 'archived'); setSelectedTemplate(null) }}>
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 text-primary">
                <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.active', { count: activeTemplates.length })}
                </TabsTrigger>
                <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.archived', { count: archivedTemplates.length })}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">{t('table.name')}</th>
                    <th className="px-3 py-2 text-left">{t('table.state')}</th>
                    <th className="px-3 py-2 text-left">{t('table.frequency')}</th>
                    <th className="px-3 py-2 text-left">{t('table.setpoint')}</th>
                    <th className="px-3 py-2 text-left">{t('table.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>{tCommon('loading')}</td></tr>
                  ) : displayedTemplates.length === 0 ? (
                    <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>{t('empty')}</td></tr>
                  ) : displayedTemplates.map((template) => {
                    const selected = selectedTemplate?.Id_Lieu_Template === template.Id_Lieu_Template
                    return (
                      <tr
                        key={template.Id_Lieu_Template}
                        className={`cursor-pointer border-t ${selected ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <td className="px-3 py-2 font-medium">{template.Nom_Template}</td>
                        <td className="px-3 py-2">{template.Lieu_Etat ?? '-'}</td>
                        <td className="px-3 py-2">{template.Frequence ?? '-'}</td>
                        <td className="px-3 py-2">{template.Consigne ?? '-'}</td>
                        <td className="px-3 py-2">{template.Description ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dialogs.create_title')}</DialogTitle>
              <DialogDescription>{t('dialogs.create_description')}</DialogDescription>
            </DialogHeader>
            {renderForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{tCommon('cancel')}</Button>
              <Button onClick={onCreate} disabled={createMutation.isPending}>{createMutation.isPending ? t('dialogs.submitting') : tCommon('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dialogs.edit_title')}</DialogTitle>
              <DialogDescription>{t('dialogs.edit_description')}</DialogDescription>
            </DialogHeader>
            {renderForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>{tCommon('cancel')}</Button>
              <Button onClick={onUpdate} disabled={editMutation.isPending}>{editMutation.isPending ? t('dialogs.submitting') : tCommon('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.archive_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('dialogs.archive_description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
                {archiveMutation.isPending ? t('dialogs.submitting') : t('actions.archive')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.delete_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('dialogs.delete_description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? t('dialogs.submitting') : tCommon('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </m.main>
    </LazyMotion>
  )
}
