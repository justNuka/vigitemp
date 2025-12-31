'use client'

import { TabsContent } from '@/components/ui/tabs'

export function LocationFormTabTelephony() {
  return (
    <TabsContent value="telephonie" className="space-y-6">
      <div className="border p-12 rounded-lg text-center">
        <p className="text-muted-foreground">
          Cette section n'est pas disponible pour les licences light. Veuillez contacter le service commercial MC2 pour faire
          une upgrade de votre licence actuelle vers une licence standard ou expert.
        </p>
      </div>
    </TabsContent>
  )
}

