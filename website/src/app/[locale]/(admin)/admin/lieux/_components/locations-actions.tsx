'use client'

import { Button } from '@/components/ui/button'
import { Archive, Pencil, Plus } from "lucide-react"
import { useTranslations } from 'next-intl'

interface Props {
  canEdit: boolean
  onCreate: () => void
  onEdit: () => void
  onArchive: () => void
}

export function LocationsActions({ canEdit, onCreate, onEdit, onArchive }: Props) {
  const t = useTranslations('locationsPage.actions')
  return (
    <div className="flex gap-2">
      <Button onClick={onCreate} variant="default" size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        {t('new')}
      </Button>
      <Button onClick={onEdit} variant="outline" disabled={!canEdit} size="sm" className="gap-2">
        <Pencil className="h-4 w-4" />
        {t('edit')}
      </Button>
      <Button onClick={onArchive} variant="outline" disabled={!canEdit} size="sm" className="gap-2">
        <Archive className="h-4 w-4" />
        {t('archive')}
      </Button>
    </div>
  )
}
