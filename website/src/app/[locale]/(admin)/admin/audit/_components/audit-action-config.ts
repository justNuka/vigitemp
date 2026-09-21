import { Activity, AlertCircle, Archive, Bell, BellOff, FileText, LogIn, LogOut, Mail, Phone, PhoneOff, Plug, Server, Settings, TrendingUp, Unplug, UserCheck, UserCog, Volume2, VolumeX, Wrench } from 'lucide-react'

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
    DS: { icon: Activity, label: t('actions.DS'), color: 'text-success', badgeVariant: 'outline' },
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
    DESA: { icon: BellOff, label: t('actions.DESA'), color: 'text-destructive', badgeVariant: 'destructive' },
    ACTA: { icon: Bell, label: t('actions.ACTA'), color: 'text-success', badgeVariant: 'outline' },
    SONS: { icon: Volume2, label: t('actions.SONS'), color: 'text-success', badgeVariant: 'outline' },
    SOND: { icon: VolumeX, label: t('actions.SOND'), color: 'text-warning', badgeVariant: 'secondary' },
    AIM: { icon: TrendingUp, label: t('actions.AIM'), color: 'text-primary', badgeVariant: 'secondary' },
    ACTU: { icon: UserCheck, label: t('actions.ACTU'), color: 'text-success', badgeVariant: 'outline' },
    AT: { icon: Phone, label: t('actions.AT'), color: 'text-primary', badgeVariant: 'secondary' },
    DT: { icon: PhoneOff, label: t('actions.DT'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    CDA: { icon: Activity, label: t('actions.CDA'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    PS: { icon: Server, label: t('actions.PS'), color: 'text-muted-foreground', badgeVariant: 'outline' },
    SACT: { icon: Unplug, label: t('actions.SACT'), color: 'text-warning', badgeVariant: 'secondary' },
    AACT: { icon: Plug, label: t('actions.AACT'), color: 'text-primary', badgeVariant: 'secondary' },
    GRPH: { icon: FileText, label: t('actions.GRPH'), color: 'text-sky-600', badgeVariant: 'outline' },
    MAIL: { icon: Mail, label: t('actions.MAIL'), color: 'text-indigo-600', badgeVariant: 'secondary' },
    ALARM_RESOLVED: { icon: AlertCircle, label: t('actions.ALARM_RESOLVED'), color: 'text-emerald-600', badgeVariant: 'outline' },
    ETAP: { icon: Wrench, label: t('actions.ETAP'), color: 'text-primary', badgeVariant: 'secondary' },
    VLOG: { icon: FileText, label: t('actions.VLOG'), color: 'text-muted-foreground', badgeVariant: 'outline' },
  }
}
