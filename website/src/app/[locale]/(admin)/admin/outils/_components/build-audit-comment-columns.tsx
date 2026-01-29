import type { ColumnDef } from "@tanstack/react-table"

import type { AuditCode, AuditComment } from "./audit-comments-types"

type BuildAuditCommentColumnsParams = {
  auditCodes: AuditCode[]
  labels: {
    type: string
    comment: string
  }
}

export function buildAuditCommentColumns({
  auditCodes,
  labels,
}: BuildAuditCommentColumnsParams): ColumnDef<AuditComment>[] {
  return [
    {
      accessorKey: "type",
      header: labels.type,
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
      header: labels.comment,
      cell: ({ row }) => <div>{row.original.text}</div>,
    },
  ]
}

