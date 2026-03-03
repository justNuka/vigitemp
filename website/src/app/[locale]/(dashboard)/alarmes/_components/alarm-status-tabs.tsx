import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type AlarmStatus = 'active' | 'acknowledged' | 'resolved'

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
  const activeTabDisabled = stats.active === 0 && statusFilter !== 'active'
  const resolvedTabDisabled = stats.resolved === 0 && statusFilter !== 'resolved'
  const acknowledgedTabDisabled = stats.acknowledged === 0 && statusFilter !== 'acknowledged'

  return (
    <Tabs value={statusFilter} onValueChange={(value) => onStatusChange(value as AlarmStatus)} className="w-full sm:w-auto">
      <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-primary/10 text-primary">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger value="active" data-testid="tab-active" disabled={activeTabDisabled} className={cn('data-[state=active]:bg-primary data-[state=active]:text-primary-foreground', activeTabDisabled && 'opacity-50 cursor-not-allowed')}>
                <span className="flex items-center gap-1">{t('tabs.active')}{stats.active > 0 && <span>({stats.active})</span>}</span>
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {activeTabDisabled ? <TooltipContent>{t('tabs.empty_tooltip')}</TooltipContent> : null}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger value="resolved" data-testid="tab-resolved" disabled={resolvedTabDisabled} className={cn('data-[state=active]:bg-primary data-[state=active]:text-primary-foreground', resolvedTabDisabled && 'opacity-50 cursor-not-allowed')}>
                {t('tabs.resolved')} ({stats.resolved})
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {resolvedTabDisabled ? <TooltipContent>{t('tabs.empty_tooltip')}</TooltipContent> : null}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <TabsTrigger value="acknowledged" data-testid="tab-acknowledged" disabled={acknowledgedTabDisabled} className={cn('data-[state=active]:bg-primary data-[state=active]:text-primary-foreground', acknowledgedTabDisabled && 'opacity-50 cursor-not-allowed')}>
                {t('tabs.acknowledged')} ({stats.acknowledged})
              </TabsTrigger>
            </span>
          </TooltipTrigger>
          {acknowledgedTabDisabled ? <TooltipContent>{t('tabs.empty_tooltip')}</TooltipContent> : null}
        </Tooltip>
      </TabsList>
    </Tabs>
  )
}
