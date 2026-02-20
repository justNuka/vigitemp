import * as z from "zod";

export const createUserSchema = z
  .object({
    username: z.string().min(3, "Le login doit contenir au moins 3 caract\u00E8res"),
    password: z.string().min(1, "Le mot de passe est requis"),
    passwordConfirm: z.string().min(1, "La confirmation est requise"),
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le pr\u00E9nom est requis"),
    email: z.string().email("Email invalide"),
    profileId: z.string().min(1, "Le profil est requis"),
    telephone: z.string().optional(),
    siteIds: z.array(z.number()).optional(),
    groupeIds: z.array(z.number()).optional(),
    hasExpiryDate: z.boolean(),
    expiryDate: z.date().optional(),
    avatar: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  })
  .refine((data) => !data.hasExpiryDate || data.expiryDate, {
    message: "La date de validit\u00E9 est requise quand activ\u00E9e",
    path: ["expiryDate"],
  });

export const editUserSchema = z
  .object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le pr\u00E9nom est requis"),
    email: z.string().email("Email invalide"),
    profileId: z.string().min(1, "Le profil est requis"),
    telephone: z.string().optional(),
    siteIds: z.array(z.number()).optional(),
    groupeIds: z.array(z.number()).optional(),
    hasExpiryDate: z.boolean(),
    expiryDate: z.date().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
    avatar: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  })
  .refine((data) => !data.hasExpiryDate || data.expiryDate, {
    message: "La date de validit\u00E9 est requise quand activ\u00E9e",
    path: ["expiryDate"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;

