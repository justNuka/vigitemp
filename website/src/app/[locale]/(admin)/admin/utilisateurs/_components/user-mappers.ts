import type { User } from "@/lib/api"
import type { EditUserFormValues } from "./user-schemas"

export function getEditUserDefaults(user: User): EditUserFormValues {
  return {
    username: user.username || "",
    nom: user.nom || "",
    prenom: user.prenom || "",
    email: user.email || "",
    profileId: user.role,
    hasExpiryDate: false,
    expiryDate: undefined,
    password: "",
    passwordConfirm: "",
    avatar: user.avatar || "",
  }
}

