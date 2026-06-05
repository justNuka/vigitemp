import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RealiserEtalonnagePage() {
  return (
    <>
      <PageHeader title="Réaliser un étalonnage" description="Cette page accueillera le workflow d'étalonnage." />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Étalonnage</CardTitle>
            <CardDescription>Écran préparatoire en attente du workflow métier complet.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Le module d'étalonnage sera branché ici avec la sélection du lieu, de la sonde étalon, du milieu d'inter-comparaison et des documents associés.
          </CardContent>
        </Card>
      </div>
    </>
  )
}
