'use client'

import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  canEdit: boolean
  onCreate: () => void
  onEdit: () => void
  onPrint: () => void
}

export function LocationsActions({ canEdit, onCreate, onEdit, onPrint }: Props) {
  return (
    <div className="flex gap-2">
      <Button onClick={onCreate} variant="default">
        Nouveau
      </Button>
      <Button onClick={onEdit} variant="outline" disabled={!canEdit}>
        Modifier
      </Button>
      <Button onClick={onPrint} variant="ghost" size="icon" title="Imprimer la liste des lieux">
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  )
}

