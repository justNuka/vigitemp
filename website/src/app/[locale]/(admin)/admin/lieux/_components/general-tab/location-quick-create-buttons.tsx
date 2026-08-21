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
  const tSite = useTranslations('sitesDialog')
  const tSitesPage = useTranslations('sitesPage')
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
      toast.success(tSitesPage('toast.create_success'))
      setOpen(false)
      reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : tSitesPage('toast.create_error'))
    },
  })

  const handleCreate = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(tSite('validation.label_required'))
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
          {tSite('create_title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{tSite('create_title')}</DialogTitle>
          <DialogDescription>{tSite('create_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-site-name">{tSite('fields.label_label')}</Label>
            <Input
              id="quick-site-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={tSite('fields.label_placeholder')}
              maxLength={50}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-site-comment">{tSite('fields.comment_label')}</Label>
            <Textarea
              id="quick-site-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={tSite('fields.comment_placeholder')}
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
            {createMutation.isPending ? tSite('submit_creating') : tSite('submit_create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QuickCreateGroupButton() {
  const tGroup = useTranslations('groupsDialog')
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

      toast.success(tGroup('toast.create_success'))
      setOpen(false)
      reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : tGroup('toast.save_error'))
    },
  })

  const handleCreate = () => {
    const trimmedName = name.trim()
    if (!regroupement) {
      toast.error(tGroup('validation.regroupement_required'))
      return
    }
    if (!trimmedName) {
      toast.error(tGroup('validation.name_required'))
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
          {tGroup('title_create')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{tGroup('title_create')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tGroup('fields.regroupement_label')}</Label>
            <Select value={regroupement} onValueChange={setRegroupement}>
              <SelectTrigger>
                <SelectValue placeholder={tGroup('fields.regroupement_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{tGroup('fields.regroupement_1')}</SelectItem>
                <SelectItem value="2">{tGroup('fields.regroupement_2')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-group-name">{tGroup('fields.name_label')}</Label>
            <Input
              id="quick-group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={tGroup('fields.name_placeholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createMutation.isPending}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? tGroup('submit_saving') : tGroup('submit_save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
