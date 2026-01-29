'use client'

import type { CurrentUser } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

type Props = {
  userInfo: CurrentUser | null | undefined
}

export function AccountInfoCard({ userInfo }: Props) {
  const t = useTranslations('profileAccount')
  const locale = useLocale()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.login')}</label>
            <Input type="text" value={userInfo?.Login || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.email')}</label>
            <Input type="email" value={userInfo?.Adresse_Email || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.last_name')}</label>
            <Input type="text" value={userInfo?.Nom || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.first_name')}</label>
            <Input type="text" value={userInfo?.Prenom || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.profile')}</label>
            <Input type="text" value={userInfo?.profil || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.created_at')}</label>
            <Input
              type="text"
              value={
                userInfo?.Date_Creation
                  ? new Date(userInfo.Date_Creation).toLocaleDateString(locale)
                  : ''
              }
              readOnly
              className="cursor-not-allowed opacity-75"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

