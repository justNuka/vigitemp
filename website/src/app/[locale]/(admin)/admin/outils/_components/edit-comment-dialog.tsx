'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useTranslations } from 'next-intl'
import { showFormValidationToast } from '@/lib/form-toast'

type EditCommentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentType?: string
  initialText: string
  onSave: (text: string) => void
}

export function EditCommentDialog({
  open,
  onOpenChange,
  commentType,
  initialText,
  onSave,
}: EditCommentDialogProps) {
  const t = useTranslations('toolsComments.edit')
  const tCommon = useTranslations('common')
  const editSchema = z.object({
    text: z
      .string()
      .min(1, t('validation.required'))
      .max(255, t('validation.max', { max: 255 })),
  })

  type EditFormValues = z.infer<typeof editSchema>

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      text: initialText,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({ text: initialText })
  }, [initialText, open, reset])

  const currentText = watch("text")
  const textError = errors.text?.message

  const onSubmit = (values: EditFormValues) => {
    onSave(values.text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('type_label', { type: commentType || "-" })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-textarea" className="text-sm font-medium">
              {t('labels.comment')}
            </label>
            <Textarea
              id="edit-textarea"
              maxLength={255}
              rows={4}
              {...register("text")}
              aria-invalid={!!textError}
              aria-describedby={textError ? "edit-textarea-error" : undefined}
            />
            {textError && (
              <p id="edit-textarea-error" className="text-sm text-destructive">
                {String(textError)}
              </p>
            )}
            <p className="text-right text-xs text-muted-foreground">
              {t('char_count', { count: currentText.length })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

