import * as z from 'zod'

export function createChangePasswordSchema(t: {
  (key: string, values?: Record<string, any>): string
}) {
  return z
    .object({
      oldPassword: z.string().min(1, t('validation.old_required')),
      newPassword: z.string().min(1, t('validation.new_required')),
      confirmPassword: z.string().min(1, t('validation.confirm_required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.mismatch'),
      path: ['confirmPassword'],
    })
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>

