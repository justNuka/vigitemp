import assert from "node:assert/strict"

import {
  generateSmtpVerificationCode,
  hashSmtpVerificationCode,
  SMTP_VERIFICATION_CODE_LENGTH,
  verifySmtpVerificationHash,
} from "../src/lib/smtp-verification-code"
import { isSmtpConfigurationComplete } from "../src/lib/smtp-config-contract"

const secret = "test-smtp-verification-secret"
const expiresAt = new Date(Date.now() + 60_000).toISOString()
const recipient = "quality@example.test"
const code = "123456"

const hash = hashSmtpVerificationCode({
  code,
  expiresAt,
  recipient,
  secret,
})

assert.equal(
  verifySmtpVerificationHash({
    expectedHash: hash,
    code,
    expiresAt,
    recipient,
    secret,
  }),
  true,
)

assert.equal(
  verifySmtpVerificationHash({
    expectedHash: hash,
    code: "654321",
    expiresAt,
    recipient,
    secret,
  }),
  false,
)

assert.equal(
  verifySmtpVerificationHash({
    expectedHash: hash,
    code,
    expiresAt,
    recipient: "other@example.test",
    secret,
  }),
  false,
)

for (let index = 0; index < 25; index += 1) {
  const generated = generateSmtpVerificationCode()
  assert.equal(generated.length, SMTP_VERIFICATION_CODE_LENGTH)
  assert.match(generated, /^\d{6}$/)
}

assert.equal(
  isSmtpConfigurationComplete({
    host: "smtp.example.test",
    port: 587,
    user: "alerts@example.test",
    passwordConfigured: true,
    sender: "alerts@example.test",
  }),
  true,
)

assert.equal(
  isSmtpConfigurationComplete({
    host: "smtp.example.test",
    port: 587,
    user: "alerts@example.test",
    passwordConfigured: false,
    sender: "alerts@example.test",
  }),
  false,
)

console.log("smtp-verification: OK")
