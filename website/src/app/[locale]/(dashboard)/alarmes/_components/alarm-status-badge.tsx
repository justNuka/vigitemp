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
    active: {
      label: t('status.active'),
      variant: 'outline',
      className: 'border-[hsl(var(--status-critical))] bg-[hsl(var(--status-critical))] text-white',
    },
    acknowledged: {
      label: t('status.acknowledged'),
      variant: 'outline',
      className: 'border-border bg-muted/60 text-muted-foreground',
    },
    resolved: {
      label: t('status.resolved'),
      variant: 'outline',
      className: 'border-[hsl(var(--status-ended)/0.25)] bg-[hsl(var(--status-ended)/0.10)] text-[hsl(var(--status-ended))]',
    },
  }

  const config = configs[status] ?? configs.active

  return (
    <Badge variant={config.variant} className={cn('whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  )
}
