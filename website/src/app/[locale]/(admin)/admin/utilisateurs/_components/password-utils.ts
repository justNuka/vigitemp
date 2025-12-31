import type { PasswordRules } from "@/lib/api"

export function generatePasswordFromRules(rules: PasswordRules): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{};':\"|,.<>/?"

  let password = ""

  for (let i = 0; i < rules.min_uppercase; i++) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
  }
  for (let i = 0; i < rules.min_lowercase; i++) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
  }
  for (let i = 0; i < rules.min_numbers; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)]
  }
  for (let i = 0; i < rules.min_special; i++) {
    password += symbols[Math.floor(Math.random() * symbols.length)]
  }

  const all = uppercase + lowercase + numbers + symbols
  const remaining = Math.max(rules.min_length - password.length, 4)
  for (let i = 0; i < remaining; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

