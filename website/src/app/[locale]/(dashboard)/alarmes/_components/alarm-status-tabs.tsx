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
      <TabsList className="grid h-8 grid-cols-2 gap-0.5 rounded-md border border-border bg-muted/70 p-0.5 text-muted-foreground">
        <TabsTrigger value="active" data-testid="tab-active" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
          <span className="flex items-center gap-1">{t('tabs.active')}{stats.active > 0 && <span>({stats.active})</span>}</span>
        </TabsTrigger>

        <TabsTrigger value="resolved" data-testid="tab-resolved" className="h-7 rounded-[5px] px-2.5 text-[13px] font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border">
          {t('tabs.resolved')} ({stats.resolved})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
