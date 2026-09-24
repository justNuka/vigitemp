import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import type { User } from "../src/lib/api"
import { getEditUserDefaults, resolveEditUserProfileName } from "../src/app/[locale]/(admin)/admin/utilisateurs/_components/user-mappers"

const user: User = {
  id: "42",
  username: "operator",
  displayName: "Test Operator",
  nom: "Operator",
  prenom: "Test",
  email: "operator@example.test",
  role: "Responsable qualité",
  isActive: true,
  createdAt: new Date("2026-09-24T10:00:00"),
  avatar: null,
}

const profiles = [
  { id: 1, name: "Administrateur" },
  { id: 2, name: "Responsable qualité" },
]

assert.equal(resolveEditUserProfileName(user, profiles), "Responsable qualité")
assert.equal(getEditUserDefaults(user, profiles).profileId, "Responsable qualité")

const casingUser = { ...user, role: "  responsable QUALITÉ  " }
assert.equal(resolveEditUserProfileName(casingUser, profiles), "Responsable qualité")

const missingProfileUser = { ...user, role: "Profil historique" }
assert.equal(resolveEditUserProfileName(missingProfileUser, profiles), "Profil historique")

const usersClientSource = readFileSync(
  fileURLToPath(
    new URL(
      "../src/app/[locale]/(admin)/admin/utilisateurs/users-client.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
)
assert.match(usersClientSource, /const profileStatus = isEditDialogOpen \? "all" : "active"/)
assert.match(usersClientSource, /useProfiles\(shouldLoadFormData, profileStatus\)/)
assert.match(usersClientSource, /queryKey: \["profiles", "active"\]/)
assert.match(usersClientSource, /\/api\/profils\?status=active/)

const dialogSource = readFileSync(
  fileURLToPath(
    new URL(
      "../src/app/[locale]/(admin)/admin/utilisateurs/_components/edit-user-dialog.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
)
assert.match(dialogSource, /if \(profilesLoading \|\| assignedSitesLoading/)
assert.match(dialogSource, /getEditUserDefaults\(user, profiles\)/)
assert.match(dialogSource, /w-\[96vw\] max-w-5xl max-h-\[92vh\]/)
assert.match(dialogSource, /grid gap-4 md:grid-cols-2/)
assert.match(dialogSource, /grid gap-4 lg:grid-cols-2 lg:items-start/)

console.log("User edit profile selection tests passed")
