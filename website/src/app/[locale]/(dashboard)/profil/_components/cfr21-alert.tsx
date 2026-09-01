'use client'

import type { CurrentUser } from '@/lib/types'
import { AlertTriangle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatDbDateTime } from '@/lib/date-display'

import type { PasswordExpiryInfo } from './password-expiry'

type Props = {
  userInfo: CurrentUser
  passwordExpiry: PasswordExpiryInfo | null
}

export function Cfr21Alert({ userInfo, passwordExpiry }: Props) {
  const t = useTranslations('profileCfr21')
  if (!userInfo?.cfr21?.enabled) return null

  return (
    <div className="rounded-lg border-2 border-[#EABC00] bg-[#EABC00]/10 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#EABC00] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-[#EABC00] mb-1">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          {userInfo.cfr21.nonReuseable && (
            <p className="text-sm text-muted-foreground mt-2">{t('non_reuseable')}</p>
          )}
        </div>
      </div>

      <div className="border-t border-[#EABC00]/20 pt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('last_change_label')}</span>
          <span className="font-medium">
            {userInfo?.Date_Derniere_Modification_MDP
              ? formatDbDateTime(userInfo.Date_Derniere_Modification_MDP, { format: 'date' })
              : t('never')}
          </span>
        </div>

        {userInfo?.Date_Derniere_Modification_MDP && passwordExpiry && (
          <div
            className={`flex items-center gap-3 p-2 rounded ${
              passwordExpiry.isExpired
                ? 'bg-red-500/10 border border-red-200'
                : passwordExpiry.isWarning
                  ? 'bg-yellow-500/10 border border-yellow-200'
                  : 'bg-green-500/10 border border-green-200'
            }`}
          >
            <Clock
              className={`w-4 h-4 shrink-0 ${
                passwordExpiry.isExpired ? 'text-red-600' : passwordExpiry.isWarning ? 'text-yellow-600' : 'text-green-600'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                passwordExpiry.isExpired ? 'text-red-700' : passwordExpiry.isWarning ? 'text-yellow-700' : 'text-green-700'
              }`}
            >
              {passwordExpiry.isExpired ? (
                <>{t('expired')}</>
              ) : passwordExpiry.isWarning ? (
                <>
                  {t('warning', { count: passwordExpiry.daysRemaining })}
                </>
              ) : (
                <>
                  {t('valid_until', {
                    count: passwordExpiry.daysRemaining,
                    date: formatDbDateTime(passwordExpiry.expiryDate, { format: 'date' }),
                  })}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

