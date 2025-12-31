import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type EditCommentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentType?: string
  editText: string
  onEditTextChange: (value: string) => void
  onSave: () => void
}

export function EditCommentDialog({
  open,
  onOpenChange,
  commentType,
  editText,
  onEditTextChange,
  onSave,
}: EditCommentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le commentaire</DialogTitle>
          <DialogDescription>
            Type: <strong>{commentType}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-textarea" className="text-sm font-medium">
              Commentaire
            </label>
            <Textarea
              id="edit-textarea"
              value={editText}
              onChange={(event) => onEditTextChange(event.target.value)}
              maxLength={255}
              rows={4}
            />
            <p className="text-right text-xs text-muted-foreground">{editText.length}/255 caractères</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={!editText.trim()}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

