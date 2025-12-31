'use client'

import type { CurrentUser } from '@/lib/types'
import { AlertTriangle, Clock } from 'lucide-react'

import type { PasswordExpiryInfo } from './password-expiry'

type Props = {
  userInfo: CurrentUser
  passwordExpiry: PasswordExpiryInfo | null
}

export function Cfr21Alert({ userInfo, passwordExpiry }: Props) {
  if (!userInfo?.cfr21?.enabled) return null

  return (
    <div className="rounded-lg border-2 border-[#EABC00] bg-[#EABC00]/10 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#EABC00] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-[#EABC00] mb-1">Conformité CFR21 activée</h3>
          <p className="text-sm text-muted-foreground">
            Votre compte est soumis à la norme CFR21. Vous devez changer votre mot de passe régulièrement.
          </p>
          {userInfo.cfr21.nonReuseable && (
            <p className="text-sm text-muted-foreground mt-2">Les anciens mots de passe ne peuvent pas être réutilisés.</p>
          )}
        </div>
      </div>

      <div className="border-t border-[#EABC00]/20 pt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dernière modification du mot de passe :</span>
          <span className="font-medium">
            {userInfo?.Date_Derniere_Modification_MDP
              ? new Date(userInfo.Date_Derniere_Modification_MDP).toLocaleDateString('fr-FR')
              : 'Jamais'}
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
              className={`w-4 h-4 flex-shrink-0 ${
                passwordExpiry.isExpired ? 'text-red-600' : passwordExpiry.isWarning ? 'text-yellow-600' : 'text-green-600'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                passwordExpiry.isExpired ? 'text-red-700' : passwordExpiry.isWarning ? 'text-yellow-700' : 'text-green-700'
              }`}
            >
              {passwordExpiry.isExpired ? (
                <>Votre mot de passe a expiré - changement obligatoire</>
              ) : passwordExpiry.isWarning ? (
                <>
                  Vous devez changer votre mot de passe dans {passwordExpiry.daysRemaining} jour
                  {passwordExpiry.daysRemaining > 1 ? 's' : ''}
                </>
              ) : (
                <>
                  Mot de passe valide pour {passwordExpiry.daysRemaining} jour{passwordExpiry.daysRemaining > 1 ? 's' : ''} (
                  {new Date(passwordExpiry.expiryDate).toLocaleDateString('fr-FR')})
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

