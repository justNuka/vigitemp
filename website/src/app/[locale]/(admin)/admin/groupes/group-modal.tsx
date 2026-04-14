'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TemporaryMemoryControls } from '@/components/form/temporary-memory-controls'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Group } from '@/hooks/useGroups'
import { deleteJson, getJson, patchJson, postJson } from '@/lib/http'
import { showFormValidationToast } from '@/lib/form-toast'
import { Check, X } from 'lucide-react'

interface GroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  isEditing?: boolean
}

type AssignableUser = {
  id: number
  username: string
  displayName: string
}

type AssignedUser = {
  Id_Utilisateur: number
}

export function GroupModal({ open, onOpenChange, group, isEditing }: GroupModalProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('groupsDialog')
  const tCommon = useTranslations('common')

  const groupSchema = z.object({
    regroupement: z.string().min(1, t('validation.regroupement_required')),
    name: z.string().min(1, t('validation.name_required')),
    assignedUserIds: z.array(z.number()),
  })

  type GroupFormValues = z.infer<typeof groupSchema>

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      regroupement: '',
      assignedUserIds: [],
    },
    mode: 'onChange',
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'groups-dialog'],
    queryFn: () => getJson<Array<{ id: number; username: string; displayName: string }>>('/api/utilisateurs'),
    enabled: open,
  })

  const { data: assignedUsers = [] } = useQuery({
    queryKey: ['groupUsers', group?.Id_Groupe, 'dialog'],
    queryFn: () => getJson<AssignedUser[]>(`/api/groupes/${group?.Id_Groupe}/utilisateurs`),
    enabled: open && Boolean(isEditing && group?.Id_Groupe),
  })

  useEffect(() => {
    if (!open) return

    if (isEditing && group) {
      form.reset({
        name: group.Nom_Groupe || '',
        regroupement: group.Numero_Regroupement || '',
        assignedUserIds: assignedUsers.map((user) => user.Id_Utilisateur),
      })
      return
    }

    form.reset({ name: '', regroupement: '', assignedUserIds: [] })
  }, [assignedUsers, form, group, isEditing, open])

  const handleSubmit = async (values: GroupFormValues) => {
    try {
      let groupId = group?.Id_Groupe ?? null

      if (isEditing && group) {
        await patchJson(`/api/groupes/${group.Id_Groupe}`, { nom: values.name, regroupement: values.regroupement })
      } else {
        const created = await postJson<{ Id_Groupe: number }>('/api/groupes', {
          nom: values.name,
          regroupement: values.regroupement,
        })
        groupId = created.Id_Groupe
      }

      if (groupId) {
        const currentAssignedIds = isEditing ? assignedUsers.map((user) => user.Id_Utilisateur) : []
        const nextAssignedIds = values.assignedUserIds
        const currentSet = new Set(currentAssignedIds)
        const nextSet = new Set(nextAssignedIds)
        const toAdd = nextAssignedIds.filter((userId) => !currentSet.has(userId))
        const toRemove = currentAssignedIds.filter((userId) => !nextSet.has(userId))

        await Promise.all([
          ...toAdd.map((userId) => postJson(`/api/utilisateurs/${userId}/groupes`, { groupId })),
          ...toRemove.map((userId) => deleteJson(`/api/utilisateurs/${userId}/groupes/${groupId}`)),
        ])
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groups'] }),
        queryClient.invalidateQueries({ queryKey: ['groupUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ])
      router.refresh()
      toast.success(isEditing ? t('toast.update_success') : t('toast.create_success'))
      onOpenChange(false)
    } catch (error) {
      console.error('Group save error:', error)
      toast.error(error instanceof Error ? error.message : t('toast.save_error'))
    }
  }

  const isSubmitting = form.formState.isSubmitting
  const memoryKey = `group-form:${isEditing ? group?.Id_Groupe ?? 'edit' : 'new'}`
  const assignedUserIds = useWatch({ control: form.control, name: 'assignedUserIds' }) || []
  const allUserIds = users.map((user) => user.id)
  const allUsersSelected = allUserIds.length > 0 && allUserIds.every((userId) => assignedUserIds.includes(userId))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('title_edit') : t('title_create')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={{ name: '', regroupement: '', assignedUserIds: [] }}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-primary/10 text-primary">
                <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.general')}
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('tabs.users')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="regroupement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.regroupement_label')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger id="regroupement">
                            <SelectValue placeholder={t('fields.regroupement_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t('fields.regroupement_1')}</SelectItem>
                          <SelectItem value="2">{t('fields.regroupement_2')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.name_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Label>{t('users.title')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('assignedUserIds', allUsersSelected ? [] : allUserIds, { shouldDirty: true })}
                    disabled={users.length === 0}
                  >
                    {allUsersSelected ? t('actions.uncheck_all') : t('actions.check_all')}
                  </Button>
                </div>
                <Card>
                  <CardContent className="max-h-80 space-y-2 overflow-y-auto pt-6">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('users.empty')}</p>
                    ) : (
                      users.map((user) => {
                        const checked = assignedUserIds.includes(user.id)
                        return (
                          <div key={user.id} className="flex items-start gap-3 rounded-md border border-border/60 px-3 py-2">
                            <Checkbox
                              id={`group-user-${user.id}`}
                              checked={checked}
                              onCheckedChange={(nextChecked) => {
                                const current = new Set(form.getValues('assignedUserIds') || [])
                                if (nextChecked === true) current.add(user.id)
                                else current.delete(user.id)
                                form.setValue('assignedUserIds', Array.from(current), { shouldDirty: true })
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <label htmlFor={`group-user-${user.id}`} className="cursor-pointer text-sm font-medium">
                                {user.displayName}
                              </label>
                              <p className="text-xs text-muted-foreground">{user.username}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="gap-2">
                <X className="h-4 w-4" />
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? t('submit_saving') : t('submit_save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
