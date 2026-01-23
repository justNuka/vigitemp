import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"

import type { AuditCode } from "./audit-comments-types"

type CommentsFormCardProps = {
  auditCodes: AuditCode[]
  selectedType: string
  onTypeChange: (value: string) => void
  commentText: string
  onCommentTextChange: (value: string) => void
  isLoading: boolean
  onSave: () => void
}

export function CommentsFormCard({
  auditCodes,
  selectedType,
  onTypeChange,
  commentText,
  onCommentTextChange,
  isLoading,
  onSave,
}: CommentsFormCardProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Ajouter un commentaire</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="type-select" className="text-sm font-medium">
            Type de journal d’audit
          </label>
          <Combobox
            triggerId="type-select"
            value={selectedType}
            onValueChange={onTypeChange}
            options={auditCodes.map((code) => ({
              value: code.Code_Journal,
              label: `${code.Code_Journal}${code.Commentaire ? ` - ${code.Commentaire}` : ""}`,
              searchText: `${code.Code_Journal} ${code.Commentaire ?? ""}`,
            }))}
            placeholder="Sélectionner un type..."
            searchPlaceholder="Rechercher un type..."
            emptyMessage="Aucun type"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="comment-textarea" className="text-sm font-medium">
            Commentaire
          </label>
          <Textarea
            id="comment-textarea"
            placeholder="Entrer le commentaire..."
            value={commentText}
            onChange={(event) => onCommentTextChange(event.target.value)}
            maxLength={255}
            rows={4}
          />
          <p className="text-right text-xs text-muted-foreground">{commentText.length}/255 caractères</p>
        </div>

        <Button
          onClick={onSave}
          disabled={!selectedType || !commentText.trim()}
          className="w-full sm:w-auto"
        >
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  )
}
