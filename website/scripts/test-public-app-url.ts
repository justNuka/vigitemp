import assert from "node:assert/strict"

import { getLocalizedPublicAppUrl, getPublicAppUrl } from "../src/lib/public-app-url"

const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL

try {
  process.env.NEXT_PUBLIC_APP_URL = "http://192.168.63.189:3000/"

  assert.equal(getPublicAppUrl(), "http://192.168.63.189:3000")
  assert.equal(
    getLocalizedPublicAppUrl("/reset-password", "fr", null, { token: "abc123" }),
    "http://192.168.63.189:3000/fr/reinitialisation-mot-de-passe?token=abc123",
  )
  assert.equal(
    getLocalizedPublicAppUrl("/reset-password", "en", null, { token: "abc123" }),
    "http://192.168.63.189:3000/en/reset-password?token=abc123",
  )
  assert.equal(
    getLocalizedPublicAppUrl("/login", "fr"),
    "http://192.168.63.189:3000/fr/connexion",
  )
  assert.equal(
    getLocalizedPublicAppUrl("/login", "en"),
    "http://192.168.63.189:3000/en/login",
  )

  console.log("public-app-url: OK")
} finally {
  if (previousAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL
  else process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
}
