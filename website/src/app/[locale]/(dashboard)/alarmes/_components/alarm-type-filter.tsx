import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'

export type AlarmRowType = 'high' | 'low' | 'no-response' | 'sector' | 'ended'

export function AlarmTypeFilter({
  typeFilters,
  onToggleType,
  onReset,
  t,
}: {
  typeFilters: AlarmRowType[]
  onToggleType: (type: AlarmRowType, checked: boolean) => void
  onReset: () => void
  t: (key: string) => string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter-type">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{t('filters.type_label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('filters.type_label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={typeFilters.length === 0} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => checked && onReset()}>
          {t('filters.all')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={typeFilters.includes('high')} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => onToggleType('high', checked === true)}>
          {t('filters.high')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={typeFilters.includes('low')} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => onToggleType('low', checked === true)}>
          {t('filters.low')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={typeFilters.includes('no-response')} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => onToggleType('no-response', checked === true)}>
          {t('filters.no_response')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={typeFilters.includes('sector')} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => onToggleType('sector', checked === true)}>
          {t('filters.sector')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={typeFilters.includes('ended')} onSelect={(e) => e.preventDefault()} onCheckedChange={(checked) => onToggleType('ended', checked === true)}>
          {t('filters.ended')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
