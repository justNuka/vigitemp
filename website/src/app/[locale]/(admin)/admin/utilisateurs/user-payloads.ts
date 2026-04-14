import type { CreateUserInput } from "@/lib/api"
import type { CreateUserFormValues, EditUserFormValues } from "./_components/user-schemas"

export function getCreateUserPayload(values: CreateUserFormValues) {
  const { passwordConfirm, hasExpiryDate, siteIds, groupeIds, ...userData } = values
  return {
    userData: userData as CreateUserInput,
    siteIds: siteIds ?? [],
    groupIds: groupeIds ?? [],
  }
}

export function getUpdateUserPayload(values: EditUserFormValues) {
  const { passwordConfirm, hasExpiryDate, siteIds, groupeIds, password, ...userData } = values
  const updateData = { ...userData, ...(password ? { password } : {}) }

  return {
    updateData,
    siteIds: siteIds ?? null,
    groupIds: groupeIds ?? null,
  }
}


