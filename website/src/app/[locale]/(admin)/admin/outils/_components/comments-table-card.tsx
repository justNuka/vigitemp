import type { ColumnDef } from "@tanstack/react-table"
import { Edit2, Trash2 } from "lucide-react"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  return (
    <Card className="border-black dark:border-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Commentaires</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {comments.length} commentaire{comments.length > 1 ? "s" : ""}
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
            Modifier
          </Button>
          <Button
            onClick={onDeleteSelected}
            disabled={selectedCommentId === null}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TanStackTable
          columns={columns}
          data={comments}
          pageSize={20}
          emptyMessage="Aucun commentaire"
          showSearch={true}
          searchPlaceholder="Rechercher un commentaire..."
          searchField={["text"]}
          selectedRowId={selectedCommentId}
          onRowClick={(row: AuditComment) => onSelectCommentId(row.id)}
        />
      </CardContent>
    </Card>
  )
}

