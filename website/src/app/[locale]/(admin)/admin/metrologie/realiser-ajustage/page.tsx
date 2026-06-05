import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RealiserAjustagePage() {
  return (
    <>
      <PageHeader title="Réaliser un ajustage" description="Cette page accueillera le workflow d'ajustage/calibrage." />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Ajustage</CardTitle>
            <CardDescription>Écran préparatoire en attente du workflow métier complet.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Le module d'ajustage sera branché ici avec la sélection du lieu, de la sonde étalon et du milieu d'inter-comparaison.
          </CardContent>
        </Card>
      </div>
    </>
  )
}
