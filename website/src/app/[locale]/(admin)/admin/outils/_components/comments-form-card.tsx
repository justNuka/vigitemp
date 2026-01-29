'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form"
import { Controller } from "react-hook-form"
import { useTranslations } from 'next-intl'

import type { AuditCode } from "./audit-comments-types"

type CommentsFormCardProps = {
  auditCodes: AuditCode[]
  isLoading: boolean
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  control: Control<{ type: string; text: string }>
  register: UseFormRegister<{ type: string; text: string }>
  errors: FieldErrors<{ type: string; text: string }>
  isSubmitting: boolean
  commentLength: number
}

export function CommentsFormCard({
  auditCodes,
  isLoading,
  onSubmit,
  control,
  register,
  errors,
  isSubmitting,
  commentLength,
}: CommentsFormCardProps) {
  const t = useTranslations('toolsComments.form')
  const tCommon = useTranslations('common')
  const typeError = errors.type?.message
  const textError = errors.text?.message

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="type-select" className="text-sm font-medium">
              {t('labels.type')}
            </label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Combobox
                  triggerId="type-select"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={auditCodes.map((code) => ({
                    value: code.Code_Journal,
                    label: `${code.Code_Journal}${code.Commentaire ? ` - ${code.Commentaire}` : ""}`,
                    searchText: `${code.Code_Journal} ${code.Commentaire ?? ""}`,
                  }))}
                  placeholder={t('placeholders.type')}
                  searchPlaceholder={t('placeholders.type_search')}
                  emptyMessage={t('placeholders.type_empty')}
                  disabled={isLoading}
                />
              )}
            />
            {typeError && (
              <p className="text-sm text-destructive">{String(typeError)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment-textarea" className="text-sm font-medium">
              {t('labels.comment')}
            </label>
            <Textarea
              id="comment-textarea"
              placeholder={t('placeholders.comment')}
              maxLength={255}
              rows={4}
              {...register("text")}
              aria-invalid={!!textError}
              aria-describedby={textError ? "comment-text-error" : undefined}
            />
            {textError && (
              <p id="comment-text-error" className="text-sm text-destructive">
                {String(textError)}
              </p>
            )}
            <p className="text-right text-xs text-muted-foreground">
              {t('char_count', { count: commentLength })}
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {tCommon('save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
