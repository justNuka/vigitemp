import * as z from 'zod'

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
    newPassword: z.string().min(1, 'Le nouveau mot de passe est requis'),
    confirmPassword: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

