'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import type { Group } from '@/hooks/useGroups'
import { patchJson, postJson } from '@/lib/http'
import { Check, X } from "lucide-react"

interface GroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  isEditing?: boolean
}

export function GroupModal({ open, onOpenChange, group, isEditing }: GroupModalProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('groupsDialog')
  const tCommon = useTranslations('common')

  const groupSchema = z.object({
    regroupement: z.string().min(1, t('validation.regroupement_required')),
    name: z.string().min(1, t('validation.name_required')),
  })

  type GroupFormValues = z.infer<typeof groupSchema>

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      regroupement: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open) return

    if (isEditing && group) {
      form.reset({
        name: group.Nom_Groupe || '',
        regroupement: group.Numero_Regroupement || '',
      })
      return
    }

    form.reset({ name: '', regroupement: '' })
  }, [form, group, isEditing, open])

  const handleSubmit = async (values: GroupFormValues) => {
    try {
      if (isEditing && group) {
        await patchJson(`/api/groupes/${group.Id_Groupe}`, { nom: values.name, regroupement: values.regroupement })
        toast.success(t('toast.update_success'))
      } else {
        await postJson('/api/groupes', { nom: values.name, regroupement: values.regroupement })
        toast.success(t('toast.create_success'))
      }

      queryClient.invalidateQueries({ queryKey: ['groups'] })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Group save error:', error)
      toast.error(error instanceof Error ? error.message : t('toast.save_error'))
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('title_edit') : t('title_create')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
