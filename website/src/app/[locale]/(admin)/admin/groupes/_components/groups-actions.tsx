"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  regroupement: string
  onRegroupementChange: (value: string) => void
  canEdit: boolean
  canArchive: boolean
  onNew: () => void
  onEdit: () => void
  onArchive: () => void
}

export function GroupsActions({
  regroupement,
  onRegroupementChange,
  canEdit,
  onNew,
  onEdit,
  onArchive,
  canArchive,
}: Props) {
  const t = useTranslations('groupsPage')

  return (
    <div className="flex gap-2">
      <Select value={regroupement} onValueChange={onRegroupementChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('regroupement.all')}</SelectItem>
          <SelectItem value="1">{t('regroupement.one')}</SelectItem>
          <SelectItem value="2">{t('regroupement.two')}</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" onClick={onNew} variant="default" size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        {t('actions.new')}
      </Button>
      <Button type="button" onClick={onEdit} disabled={!canEdit} variant="outline" size="sm" className="gap-2">
        <Pencil className="h-4 w-4" />
        {t('actions.edit')}
      </Button>
      <Button type="button" onClick={onArchive} disabled={!canArchive} variant="outline" size="sm" className="gap-2">
        <Archive className="h-4 w-4" />
        {t('actions.archive')}
      </Button>
    </div>
  )
}
