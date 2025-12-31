'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type MeasurementPoint = {
  point: number;
  reference: string;
  value: string;
  incertitude: string;
};

type StandardMeasurementsTableProps = {
  mesures: MeasurementPoint[];
  selectedMesureIndex: number | null;
  onSelectMesure: (index: number) => void;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof MeasurementPoint, value: string) => void;
  onRequestDelete: () => void;
};

export function StandardMeasurementsTable({
  mesures,
  selectedMesureIndex,
  onSelectMesure,
  onAdd,
  onUpdate,
  onRequestDelete,
}: StandardMeasurementsTableProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Tableau de mesures</h3>

      <div className="border rounded-lg max-h-64 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead>Point</TableHead>
              <TableHead>T° référence</TableHead>
              <TableHead>T° lue</TableHead>
              <TableHead>Incertitude</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mesures.map((mesure, index) => (
              <TableRow
                key={index}
                onClick={() => onSelectMesure(index)}
                className={cn(
                  'cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedMesureIndex === index &&
                    'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-medium border-l-4 border-l-blue-600 dark:border-l-blue-400'
                )}
              >
                <TableCell>{mesure.point}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={mesure.reference}
                    onChange={(e) => onUpdate(index, 'reference', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={mesure.value}
                    onChange={(e) => onUpdate(index, 'value', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={mesure.incertitude}
                    onChange={(e) => onUpdate(index, 'incertitude', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700" size="sm">
          Nouveau
        </Button>
        <Button onClick={onRequestDelete} disabled={selectedMesureIndex === null} variant="outline" size="sm">
          Supprimer
        </Button>
      </div>
    </div>
  );
}

