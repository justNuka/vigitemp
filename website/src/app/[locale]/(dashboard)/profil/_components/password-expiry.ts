import type { CurrentUser } from '@/lib/types'

export type PasswordExpiryInfo = {
  daysRemaining: number
  expiryDate: Date
  isExpired: boolean
  isWarning: boolean
}

export function getPasswordExpiry(userInfo: CurrentUser | null | undefined): PasswordExpiryInfo | null {
  if (!userInfo?.Date_Derniere_Modification_MDP || !userInfo?.cfr21?.enabled) return null

  const lastChangeDate = new Date(userInfo.Date_Derniere_Modification_MDP)
  const expiryDate = new Date(lastChangeDate)
  expiryDate.setDate(expiryDate.getDate() + userInfo.cfr21.passwordMaxAgeDays)

  const today = new Date()
  const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return {
    daysRemaining,
    expiryDate,
    isExpired: daysRemaining <= 0,
    isWarning: daysRemaining > 0 && daysRemaining <= 30,
  }
}

