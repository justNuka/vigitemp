'use client'

import { TabsContent } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'

export function LocationFormTabTelephony() {
  const t = useTranslations('locationsForm.telephony')
  return (
    <TabsContent value="telephonie" className="space-y-6">
      <div className="border p-12 rounded-lg text-center">
        <p className="text-muted-foreground">
          {t('unavailable_light')}
        </p>
      </div>
    </TabsContent>
  )
}

