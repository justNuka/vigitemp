'use client'

import type { CurrentUser } from '@/lib/types'
import type { PasswordRules } from '@/lib/api'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

import { getPasswordExpiry } from './password-expiry'
import { Cfr21Alert } from './cfr21-alert'
import { ChangePasswordForm } from './change-password-form'

type Props = {
  userInfo: CurrentUser
  rules: PasswordRules | null | undefined
}

export function SecurityCard({ userInfo, rules }: Props) {
  const passwordExpiry = getPasswordExpiry(userInfo)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Sécurité
        </CardTitle>
        <CardDescription>Modifiez votre mot de passe en respectant les règles de sécurité</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Cfr21Alert userInfo={userInfo} passwordExpiry={passwordExpiry} />
        <ChangePasswordForm rules={rules} />
      </CardContent>
    </Card>
  )
}

