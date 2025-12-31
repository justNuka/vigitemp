import type { ColumnDef } from "@tanstack/react-table"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { ProbeWithSelection } from "./probe-types"

type ProbesTableCardProps = {
  probes: ProbeWithSelection[]
  columns: ColumnDef<ProbeWithSelection>[]
  isLoading: boolean
  selectedCount: number
  onLaunchTests: () => void
  onToggleAll: () => void
  onDeselectAll: () => void
  onReset: () => void
}

export function ProbesTableCard({
  probes,
  columns,
  isLoading,
  selectedCount,
  onLaunchTests,
  onToggleAll,
  onDeselectAll,
  onReset,
}: ProbesTableCardProps) {
  const allSelected = probes.length > 0 && selectedCount === probes.length

  return (
    <Card className="border-black dark:border-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Sondes</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {probes.length} sonde{probes.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={onLaunchTests} disabled={selectedCount === 0 || isLoading} size="sm">
          {isLoading ? "Test en cours..." : "Lancer les tests"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TanStackTable
            columns={columns}
            data={probes}
            pageSize={10}
            maxHeight="60vh"
            isLoading={isLoading}
            emptyMessage="Aucune sonde disponible"
            showSearch={true}
            searchPlaceholder="Rechercher une sonde..."
            searchField={["Sonde_Numero_Serie", "Adresse_Sonde", "Module"]}
          />

          <div className="flex gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={onToggleAll}>
              {allSelected ? "Tout décocher" : "Tout cocher"}
            </Button>
            {selectedCount > 0 && (
              <Button variant="outline" size="sm" onClick={onDeselectAll}>
                Décocher la sélection
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onReset}>
              Réinitialiser états
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

