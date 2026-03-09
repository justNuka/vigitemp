import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type BadgeConfig = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

export function AlarmStatusBadge({ status }: { status: string }) {
  const t = useTranslations('alarmsPage')
  const configs: Record<string, BadgeConfig> = {
    active: { label: t('status.active'), variant: 'destructive' },
    acknowledged: {
      label: t('status.acknowledged'),
      variant: 'outline',
      className: 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-400',
    },
    resolved: {
      label: t('status.resolved'),
      variant: 'outline',
      className: 'border-green-400 bg-green-50 text-green-700 dark:border-green-500/50 dark:bg-green-500/10 dark:text-green-400',
    },
  }

  const config = configs[status] ?? configs.active

  return (
    <Badge variant={config.variant} className={cn('whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  )
}
