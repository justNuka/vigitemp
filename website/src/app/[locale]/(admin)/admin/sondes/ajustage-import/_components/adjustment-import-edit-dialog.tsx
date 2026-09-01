'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdjustmentImportEditDialogProps {
  open: boolean
  title: string
  operatorLabel: string
  unitLabel: string
  operator: string
  unit: string
  onOperatorChange: (value: string) => void
  onUnitChange: (value: string) => void
  onClose: () => void
  onApply: () => void
  cancelLabel: string
  applyLabel: string
}

export function AdjustmentImportEditDialog({
  open,
  title,
  operatorLabel,
  unitLabel,
  operator,
  unit,
  onOperatorChange,
  onUnitChange,
  onClose,
  onApply,
  cancelLabel,
  applyLabel,
}: AdjustmentImportEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(openState) => (!openState ? onClose() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{operatorLabel}</label>
            <Input value={operator} onChange={(event) => onOperatorChange(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{unitLabel}</label>
            <Input value={unit} onChange={(event) => onUnitChange(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>{cancelLabel}</Button>
            <Button onClick={onApply}>{applyLabel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
