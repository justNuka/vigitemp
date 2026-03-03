import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export function AlarmStatusBadge({ status }: { status: string }) {
  const t = useTranslations('alarmsPage')
  const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: t('status.active'), variant: 'destructive' },
    acknowledged: { label: t('status.acknowledged'), variant: 'secondary' },
    resolved: { label: t('status.resolved'), variant: 'outline' },
  }

  const config = configs[status] || configs.active

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      {config.label}
    </Badge>
  )
}
