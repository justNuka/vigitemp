'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Group } from '@/hooks/useGroups'
import type { SiteSimple } from '@/hooks/useSites'
import { postJson } from '@/lib/http'

import type { LocationFormData } from '../location-form-types'

type CreatedSite = {
  Id_Site: number
  Libelle_Site: string | null
}

type CreateSiteVariables = {
  name: string
  comment: string
}

type CreateGroupVariables = {
  name: string
  regroupement: string
}

function sortSites(sites: SiteSimple[]) {
  return [...sites].sort((a, b) => a.name.localeCompare(b.name))
}

function sortGroups(groups: Group[]) {
  return [...groups].sort((a, b) => (a.Nom_Groupe ?? '').localeCompare(b.Nom_Groupe ?? ''))
}

export function QuickCreateSiteButton() {
  const t = useTranslations('locationsForm.general.quick_create')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const { setValue } = useFormContext<LocationFormData>()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')

  const reset = () => {
    setName('')
    setComment('')
  }

  const createMutation = useMutation({
    mutationFn: ({ name: siteName, comment: siteComment }: CreateSiteVariables) =>
      postJson<CreatedSite>('/api/sites', {
        Libelle_Site: siteName,
        Commentaire: siteComment || null,
      }),
    onSuccess: (created, variables) => {
      const createdSite: SiteSimple = {
        id: created.Id_Site,
        name: created.Libelle_Site || variables.name,
      }

      queryClient.setQueryData<SiteSimple[]>(['sites-simple'], (current) => {
        const withoutCreated = (current ?? []).filter((site) => site.id !== createdSite.id)
        return sortSites([...withoutCreated, createdSite])
      })
      void queryClient.invalidateQueries({ queryKey: ['sites-simple'] })
      void queryClient.invalidateQueries({ queryKey: ['sites'] })

      setValue('Id_Site', created.Id_Site, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      toast.success(t('site_success', { name: createdSite.name }))
      setOpen(false)
      reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('site_error'))
    },
  })

  const handleCreate = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(t('site_name_required'))
      return
    }

    createMutation.mutate({
      name: trimmedName,
      comment: comment.trim(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen && !createMutation.isPending) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          {t('site_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t('site_title')}</DialogTitle>
          <DialogDescription>{t('site_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-site-name">{t('site_name')}</Label>
            <Input
              id="quick-site-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('site_name_placeholder')}
              maxLength={50}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-site-comment">{t('site_comment')}</Label>
            <Textarea
              id="quick-site-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t('site_comment_placeholder')}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? t('creating') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QuickCreateGroupButton() {
  const t = useTranslations('locationsForm.general.quick_create')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const { getValues, setValue } = useFormContext<LocationFormData>()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [regroupement, setRegroupement] = useState('')

  const reset = () => {
    setName('')
    setRegroupement('')
  }

  const createMutation = useMutation({
    mutationFn: ({ name: groupName, regroupement: groupRegroupement }: CreateGroupVariables) =>
      postJson<Group>('/api/groupes', {
        nom: groupName,
        regroupement: groupRegroupement,
      }),
    onSuccess: (created, variables) => {
      const normalizedGroup: Group = {
        ...created,
        Nom_Groupe: created.Nom_Groupe || variables.name,
        Numero_Regroupement: created.Numero_Regroupement || variables.regroupement,
        Est_Archive: created.Est_Archive ?? false,
        nombre_lieux: created.nombre_lieux ?? 0,
        nombre_utilisateurs: created.nombre_utilisateurs ?? 0,
      }

      queryClient.setQueryData<Group[]>(['groups', undefined, 'active'], (current) => {
        const withoutCreated = (current ?? []).filter((group) => group.Id_Groupe !== normalizedGroup.Id_Groupe)
        return sortGroups([...withoutCreated, normalizedGroup])
      })
      void queryClient.invalidateQueries({ queryKey: ['groups'] })

      const currentGroupIds = getValues('GroupIds') ?? []
      if (!currentGroupIds.includes(normalizedGroup.Id_Groupe)) {
        setValue('GroupIds', [...currentGroupIds, normalizedGroup.Id_Groupe], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      }

      toast.success(t('group_success', { name: normalizedGroup.Nom_Groupe || variables.name }))
      setOpen(false)
      reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('group_error'))
    },
  })

  const handleCreate = () => {
    const trimmedName = name.trim()
    if (!regroupement) {
      toast.error(t('group_regroupement_required'))
      return
    }
    if (!trimmedName) {
      toast.error(t('group_name_required'))
      return
    }

    createMutation.mutate({
      name: trimmedName,
      regroupement,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen && !createMutation.isPending) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          {t('group_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t('group_title')}</DialogTitle>
          <DialogDescription>{t('group_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('group_regroupement')}</Label>
            <Select value={regroupement} onValueChange={setRegroupement}>
              <SelectTrigger>
                <SelectValue placeholder={t('group_regroupement_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('group_regroupement_1')}</SelectItem>
                <SelectItem value="2">{t('group_regroupement_2')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-group-name">{t('group_name')}</Label>
            <Input
              id="quick-group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('group_name_placeholder')}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? t('creating') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
