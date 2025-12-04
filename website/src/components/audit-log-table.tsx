import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn, 
  LogOut, 
  Bell, 
  Settings, 
  UserCog,
  AlertCircle,
  FileText
} from "lucide-react";
import type { AuditLog } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

const actionConfig: Record<string, { 
  icon: typeof LogIn; 
  label: string; 
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}> = {
  login: { icon: LogIn, label: "Connexion", color: "text-success", badgeVariant: "outline" },
  logout: { icon: LogOut, label: "Déconnexion", color: "text-muted-foreground", badgeVariant: "outline" },
  alarm_acknowledged: { icon: Bell, label: "Alarme acquittée", color: "text-warning", badgeVariant: "secondary" },
  alarm_disabled: { icon: AlertCircle, label: "Alarme désactivée", color: "text-destructive", badgeVariant: "destructive" },
  alarm_enabled: { icon: AlertCircle, label: "Alarme activée", color: "text-success", badgeVariant: "outline" },
  settings_changed: { icon: Settings, label: "Paramètres modifiés", color: "text-primary", badgeVariant: "secondary" },
  user_created: { icon: UserCog, label: "Utilisateur créé", color: "text-primary", badgeVariant: "default" },
  user_updated: { icon: UserCog, label: "Utilisateur modifié", color: "text-primary", badgeVariant: "secondary" },
  password_changed: { icon: UserCog, label: "Mot de passe changé", color: "text-warning", badgeVariant: "outline" },
};

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return <AuditLogTableSkeleton />;
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Aucune entrée dans le journal</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Date / Heure</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>Cible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <AuditLogRow key={log.id} log={log} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface AuditLogRowProps {
  log: AuditLog;
}

function AuditLogRow({ log }: AuditLogRowProps) {
  const config = actionConfig[log.action] || {
    icon: FileText,
    label: log.action,
    color: "text-muted-foreground",
    badgeVariant: "outline" as const,
  };
  const Icon = config.icon;
  const timestamp = new Date(log.timestamp);

  return (
    <TableRow data-testid={`row-audit-${log.id}`}>
      <TableCell className="font-mono text-sm whitespace-nowrap">
        {format(timestamp, "dd/MM/yyyy HH:mm:ss", { locale: fr })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.color)} />
          <Badge variant={config.badgeVariant} className="whitespace-nowrap">
            {config.label}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">
          {log.userId || "Système"}
        </span>
      </TableCell>
      <TableCell className="max-w-[300px]">
        <p className="truncate text-sm text-muted-foreground" title={log.details || undefined}>
          {log.details || "-"}
        </p>
      </TableCell>
      <TableCell>
        {log.targetType && log.targetId ? (
          <span className="text-sm">
            <span className="text-muted-foreground capitalize">{log.targetType}:</span>{" "}
            <span className="font-mono text-xs">{log.targetId.slice(0, 8)}...</span>
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function AuditLogTableSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[180px]">Date / Heure</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Détails</TableHead>
            <TableHead>Cible</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
