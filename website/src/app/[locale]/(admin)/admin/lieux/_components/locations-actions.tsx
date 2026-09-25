'use client'

import { Button } from '@/components/ui/button'
import { Archive, Copy, Pencil, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  canEdit: boolean
  canDuplicate: boolean
  onCreate: () => void
  onEdit: () => void
  onDuplicate: () => void
  onArchive: () => void
}

export function LocationsActions({ canEdit, canDuplicate, onCreate, onEdit, onDuplicate, onArchive }: Props) {
  const t = useTranslations('locationsPage.actions')
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onCreate} variant="default" size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        {t('new')}
      </Button>
      <Button onClick={onDuplicate} variant="outline" disabled={!canDuplicate} size="sm" className="gap-2">
        <Copy className="h-4 w-4" />
        {t('duplicate')}
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
