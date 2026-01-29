'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { PasswordRules } from '@/lib/api'
import { validatePassword } from '@/lib/password-validation'
import { postJson } from '@/lib/http'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordField } from '@/components/password/password-field'
import { PasswordRulesList } from '@/components/password/password-rules-list'
import { PasswordStrengthMeter } from '@/components/password/password-strength-meter'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { createChangePasswordSchema, type ChangePasswordFormValues } from './change-password-schema'

type Props = {
  rules: PasswordRules | null | undefined
  rulesLoading: boolean
}

export function ChangePasswordForm({ rules, rulesLoading }: Props) {
  const t = useTranslations('profilePassword')
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = form.watch('newPassword')
  const validation = rules ? validatePassword(newPassword, rules) : null
  const confirmPassword = form.watch('confirmPassword')
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError(null)

    if (!validation?.isValid) {
      setError(t('errors.invalid_rules'))
      return
    }

    try {
      await postJson<{ message: string; isFirstPasswordChange?: boolean }>('/api/profil/change-password', data)

      toast({
        title: t('toast.title'),
        description: t('toast.description'),
      })

      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.old.label')}</FormLabel>
              <FormControl>
                <PasswordField
                  id="oldPassword"
                  label={t('fields.old.label')}
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: t('fields.old.placeholder'),
                    autoComplete: 'current-password',
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.new.label')}</FormLabel>
              <FormControl>
                <PasswordField
                  id="newPassword"
                  label={t('fields.new.label')}
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: t('fields.new.placeholder'),
                    autoComplete: 'new-password',
                  }}
                />
              </FormControl>
              <FormMessage />

              <PasswordStrengthMeter password={newPassword} />
              {rulesLoading ? (
                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                  {t('rules.loading')}
                </div>
              ) : rules ? (
                <div className="rounded-md border p-3 text-sm">
                  <PasswordRulesList password={newPassword} rules={rules} title={t('rules.title')} />
                </div>
              ) : null}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.confirm.label')}</FormLabel>
              <FormControl>
                <PasswordField
                  id="confirmPassword"
                  label={t('fields.confirm.label')}
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: t('fields.confirm.placeholder'),
                    autoComplete: 'new-password',
                  }}
                />
              </FormControl>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">{t('match.ok')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">{t('match.ko')}</span>
                    </>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !validation?.isValid || !passwordsMatch}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submit.loading')}
            </>
          ) : (
            t('submit.label')
          )}
        </Button>
      </form>
    </Form>
  )
}

