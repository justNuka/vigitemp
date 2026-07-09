import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Translate = (key: string, values?: Record<string, string>) => string

export type MonitoringGroupModalState = {
  groupId: number
  groupName: string
  isActive: boolean
}

type MonitoringGroupToggleDialogProps = {
  modal: MonitoringGroupModalState | null
  disableDuration: string
  actionComment: string
  actionCommentError: string | null
  requireActionComment: boolean
  onDisableDurationChange: (value: string) => void
  onActionCommentChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
  t: Translate
}

export function MonitoringGroupToggleDialog({
  modal,
  disableDuration,
  actionComment,
  actionCommentError,
  requireActionComment,
  onDisableDurationChange,
  onActionCommentChange,
  onClose,
  onConfirm,
  t,
}: MonitoringGroupToggleDialogProps) {
  const translateOrFallback = (key: string, fallback: string) => {
    const translated = t(key)
    return translated === key ? fallback : translated
  }

  const commentLabel = translateOrFallback("confirm.action_comment.label", "Commentaire")
  const commentPlaceholder = requireActionComment
    ? translateOrFallback("confirm.action_comment.placeholder_required", "Ajouter un commentaire (obligatoire)")
    : translateOrFallback("confirm.action_comment.placeholder_optional", "Ajouter un commentaire (optionnel)")

  return (
    <Dialog open={modal !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("group_modal.title")}</DialogTitle>
          <DialogDescription>
            {modal
              ? t("group_modal.description", {
                  action: modal.isActive
                    ? t("group_modal.action_disable")
                    : t("group_modal.action_enable"),
                  group: modal.groupName,
                })
              : null}
          </DialogDescription>
        </DialogHeader>
        {modal?.isActive ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("group_modal.duration_label")}</label>
            <Select value={disableDuration} onValueChange={onDisableDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("group_modal.duration_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">{t("group_modal.duration_options.15")}</SelectItem>
                <SelectItem value="60">{t("group_modal.duration_options.60")}</SelectItem>
                <SelectItem value="240">{t("group_modal.duration_options.240")}</SelectItem>
                <SelectItem value="720">{t("group_modal.duration_options.720")}</SelectItem>
                <SelectItem value="manual">{t("group_modal.duration_options.manual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="group-toggle-comment">
            {commentLabel}
          </label>
          <Textarea
            id="group-toggle-comment"
            value={actionComment}
            onChange={(event) => onActionCommentChange(event.target.value)}
            placeholder={commentPlaceholder}
            aria-invalid={actionCommentError ? "true" : "false"}
            className="min-h-24"
          />
          {actionCommentError ? <p className="text-xs text-destructive">{actionCommentError}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("group_modal.cancel")}
          </Button>
          <Button variant={modal?.isActive ? "destructive" : "default"} onClick={onConfirm}>
            {t("group_modal.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
