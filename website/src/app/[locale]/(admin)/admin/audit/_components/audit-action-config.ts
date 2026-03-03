import { Activity, AlertCircle, Archive, Bell, FileText, LogIn, LogOut, Plug, Settings, UserCog, Wrench } from 'lucide-react'

export type ActionConfig = {
  icon: typeof LogIn
  label: string
  color: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function buildAuditActionConfig(t: (key: string, values?: Record<string, string | number>) => string): Record<string, ActionConfig> {
  return {
    CONNEXION: { icon: LogIn, label: t('actions.CONNEXION'), color: 'text-success', badgeVariant: 'outline' },
    DECONNEXION: { icon: LogOut, label: t('actions.DECONNEXION'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    ACQ: { icon: Bell, label: t('actions.ACQ'), color: 'text-warning', badgeVariant: 'secondary' },
    DES: { icon: AlertCircle, label: t('actions.DES'), color: 'text-destructive', badgeVariant: 'destructive' },
    ACT: { icon: AlertCircle, label: t('actions.ACT'), color: 'text-success', badgeVariant: 'outline' },
    AS: { icon: AlertCircle, label: t('actions.AS'), color: 'text-destructive', badgeVariant: 'destructive' },
    CC: { icon: FileText, label: t('actions.CC'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    CF: { icon: Settings, label: t('actions.CF'), color: 'text-primary', badgeVariant: 'secondary' },
    CR: { icon: Settings, label: t('actions.CR'), color: 'text-primary', badgeVariant: 'secondary' },
    CS: { icon: Settings, label: t('actions.CS'), color: 'text-primary', badgeVariant: 'secondary' },
    AJE: { icon: Activity, label: t('actions.AJE'), color: 'text-primary', badgeVariant: 'secondary' },
    CA: { icon: Wrench, label: t('actions.CA'), color: 'text-primary', badgeVariant: 'secondary' },
    ET: { icon: Wrench, label: t('actions.ET'), color: 'text-primary', badgeVariant: 'secondary' },
    TC: { icon: Plug, label: t('actions.TC'), color: 'text-primary', badgeVariant: 'secondary' },
    MDP: { icon: UserCog, label: t('actions.MDP'), color: 'text-warning', badgeVariant: 'outline' },
    ARC: { icon: Archive, label: t('actions.ARC'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    ALARM_RESOLVED: { icon: Bell, label: t('actions.ALARM_RESOLVED'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    settings_changed: { icon: Settings, label: t('actions.settings_changed'), color: 'text-primary', badgeVariant: 'secondary' },
    user_created: { icon: UserCog, label: t('actions.user_created'), color: 'text-primary', badgeVariant: 'default' },
    user_updated: { icon: UserCog, label: t('actions.user_updated'), color: 'text-primary', badgeVariant: 'secondary' },
  }
}
