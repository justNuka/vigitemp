'use client'

import type { CurrentUser } from '@/lib/types'
import type { PasswordRules } from '@/lib/api'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { getPasswordExpiry } from './password-expiry'
import { Cfr21Alert } from './cfr21-alert'
import { ChangePasswordForm } from './change-password-form'

type Props = {
  userInfo: CurrentUser
  rules: PasswordRules | null | undefined
  rulesLoading: boolean
}

export function SecurityCard({ userInfo, rules, rulesLoading }: Props) {
  const t = useTranslations('profileSecurity')
  const passwordExpiry = getPasswordExpiry(userInfo)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Cfr21Alert userInfo={userInfo} passwordExpiry={passwordExpiry} />
        <ChangePasswordForm rules={rules} rulesLoading={rulesLoading} />
      </CardContent>
    </Card>
  )
}

