'use client';

import { cn } from "@/lib/utils";
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
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
}

interface AuditLogRow {
  id: string;
  timestamp: string | Date;
  action: string;
  userId: string | null;
  details: string | null;
  targetType: string | null;
  targetId: string | null;
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
  // Colonnes TanStack
  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: "timestamp",
      header: "Date / Heure",
      cell: ({ row }) => {
        const timestamp = new Date(row.getValue("timestamp") as string);
        return (
          <span className="font-mono text-sm whitespace-nowrap">
            {format(timestamp, "dd/MM/yyyy HH:mm:ss", { locale: fr })}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        const config = actionConfig[action] || {
          icon: FileText,
          label: action,
          color: "text-muted-foreground",
          badgeVariant: "outline" as const,
        };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config.color)} />
            <Badge variant={config.badgeVariant} className="whitespace-nowrap">
              {config.label}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "userId",
      header: "Utilisateur",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("userId") || "Système"}</span>
      ),
    },
    {
      accessorKey: "details",
      header: "Détails",
      cell: ({ row }) => {
        const details = row.getValue("details") as string | null;
        return (
          <p className="truncate text-sm text-muted-foreground max-w-[300px]" title={details || undefined}>
            {details || "-"}
          </p>
        );
      },
    },
    {
      accessorKey: "targetId",
      header: "Cible",
      cell: ({ row }) => {
        const targetType = row.original.targetType;
        const targetId = row.getValue("targetId") as string | null;
        if (targetType && targetId) {
          return (
            <span className="text-sm">
              <span className="text-muted-foreground capitalize">{targetType}:</span>{" "}
              <span className="font-mono text-xs">{targetId.slice(0, 8)}...</span>
            </span>
          );
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },
  ];

  const tableData: AuditLogRow[] = logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    userId: log.userId,
    details: log.details,
    targetType: log.targetType,
    targetId: log.targetId,
  }));

  return (
    <TanStackTable<AuditLogRow>
      columns={columns}
      data={tableData}
      searchPlaceholder="Rechercher dans les logs d'audit..."
      pageSize={20}
      isLoading={isLoading}
      emptyMessage="Aucun log d'audit trouvé"
      showSearch={false}
    />
  );
}
