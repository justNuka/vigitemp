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

import { changePasswordSchema, type ChangePasswordFormValues } from './change-password-schema'

type Props = {
  rules: PasswordRules | null | undefined
}

export function ChangePasswordForm({ rules }: Props) {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
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
      setError('Veuillez respecter toutes les règles de mot de passe')
      return
    }

    try {
      await postJson<{ message: string; isFirstPasswordChange?: boolean }>('/api/profil/change-password', data)

      toast({
        title: 'Mot de passe changé',
        description: 'Votre mot de passe a été changé avec succès',
      })

      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
              <FormLabel>Ancien mot de passe</FormLabel>
              <FormControl>
                <PasswordField
                  id="oldPassword"
                  label="Ancien mot de passe"
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: 'Entrez votre ancien mot de passe',
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
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <PasswordField
                  id="newPassword"
                  label="Nouveau mot de passe"
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: 'Entrez votre nouveau mot de passe',
                    autoComplete: 'new-password',
                  }}
                />
              </FormControl>
              <FormMessage />

              <PasswordStrengthMeter password={newPassword} />

              {rules && (
                <div className="rounded-md border p-3 text-sm">
                  <PasswordRulesList password={newPassword} rules={rules} title="Règles à respecter :" />
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <PasswordField
                  id="confirmPassword"
                  label="Confirmer le mot de passe"
                  hideLabel
                  required
                  disabled={form.formState.isSubmitting}
                  inputProps={{
                    ...field,
                    placeholder: 'Confirmez votre nouveau mot de passe',
                    autoComplete: 'new-password',
                  }}
                />
              </FormControl>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Les mots de passe ne correspondent pas</span>
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
              Changement en cours...
            </>
          ) : (
            'Changer le mot de passe'
          )}
        </Button>
      </form>
    </Form>
  )
}

