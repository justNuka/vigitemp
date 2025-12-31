import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
    <Card className="border-black dark:border-black">
      <CardHeader>
        <CardTitle>Ajouter un commentaire</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="type-select" className="text-sm font-medium">
            Type de journal d’audit
          </label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger id="type-select" disabled={isLoading}>
              <SelectValue placeholder="Sélectionner un type..." />
            </SelectTrigger>
            <SelectContent>
              {auditCodes.map((code) => (
                <SelectItem key={code.Code_Journal} value={code.Code_Journal}>
                  {code.Code_Journal} {code.Commentaire ? `- ${code.Commentaire}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

