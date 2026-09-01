import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type AlarmStatus = 'active' | 'resolved'

export function AlarmStatusTabs({
  statusFilter,
  stats,
  onStatusChange,
  t,
}: {
  statusFilter: AlarmStatus
  stats: { active: number; acknowledged: number; resolved: number }
  onStatusChange: (status: AlarmStatus) => void
  t: (key: string) => string
}) {
  return (
    <Tabs value={statusFilter} onValueChange={(value) => onStatusChange(value as AlarmStatus)} className="w-full sm:w-auto">
      <TabsList className="grid grid-cols-2 w-full sm:w-auto bg-primary/10 text-primary">
        <TabsTrigger value="active" data-testid="tab-active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span className="flex items-center gap-1">{t('tabs.active')}{stats.active > 0 && <span>({stats.active})</span>}</span>
        </TabsTrigger>

        <TabsTrigger value="resolved" data-testid="tab-resolved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          {t('tabs.resolved')} ({stats.resolved})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
