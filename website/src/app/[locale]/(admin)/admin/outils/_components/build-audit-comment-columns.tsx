import type { ColumnDef } from "@tanstack/react-table"

import type { AuditCode, AuditComment } from "./audit-comments-types"

type BuildAuditCommentColumnsParams = {
  auditCodes: AuditCode[]
}

export function buildAuditCommentColumns({
  auditCodes,
}: BuildAuditCommentColumnsParams): ColumnDef<AuditComment>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const code = auditCodes.find((item) => item.Code_Journal === row.original.type)
        return (
          <div>
            <p className="font-medium">{row.original.type}</p>
            <p className="text-xs text-muted-foreground">{code?.Commentaire}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "text",
      header: "Commentaire",
      cell: ({ row }) => <div>{row.original.text}</div>,
    },
  ]
}

