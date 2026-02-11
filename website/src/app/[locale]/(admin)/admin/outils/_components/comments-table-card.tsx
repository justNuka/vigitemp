'use client'

import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Trash2 } from "lucide-react"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from 'next-intl'

import type { AuditComment } from "./audit-comments-types"

type CommentsTableCardProps = {
  comments: AuditComment[]
  columns: ColumnDef<AuditComment>[]
  selectedCommentId: number | null
  onSelectCommentId: (id: number) => void
  onOpenEdit: () => void
  onDeleteSelected: () => void
}

export function CommentsTableCard({
  comments,
  columns,
  selectedCommentId,
  onSelectCommentId,
  onOpenEdit,
  onDeleteSelected,
}: CommentsTableCardProps) {
  const t = useTranslations('toolsComments.table')
  const tCommon = useTranslations('common')
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('count', { count: comments.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onOpenEdit}
            disabled={selectedCommentId === null}
            variant="outline"
            size="sm"
          >
            <Edit2 className="mr-1 h-4 w-4" />
            {tCommon('edit')}
          </Button>
          <Button
            onClick={onDeleteSelected}
            disabled={selectedCommentId === null}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {tCommon('delete')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TanStackTable
          columns={columns}
          data={comments}
          pageSize={20}
          maxHeight="calc(100dvh - 25rem)"
          emptyMessage={t('empty')}
          showSearch={true}
          searchPlaceholder={t('search_placeholder')}
          searchField={["text"]}
          selectedRowId={selectedCommentId}
          onRowClick={(row: AuditComment) => onSelectCommentId(row.id)}
          onRowDoubleClick={(row: AuditComment) => {
            onSelectCommentId(row.id)
            onOpenEdit()
          }}
          headerClassName="!bg-sidebar/90 !text-sidebar-foreground backdrop-blur supports-backdrop-filter:!bg-sidebar/80"
          headerCellClassName="!bg-sidebar/90 !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar/80 backdrop-blur supports-backdrop-filter:!bg-sidebar/80"
          tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
        />
      </CardContent>
    </Card>
  )
}

