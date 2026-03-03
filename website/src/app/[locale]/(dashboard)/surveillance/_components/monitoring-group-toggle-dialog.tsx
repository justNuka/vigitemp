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

type Translate = (key: string, values?: Record<string, string>) => string

export type MonitoringGroupModalState = {
  groupId: number
  groupName: string
  isActive: boolean
}

type MonitoringGroupToggleDialogProps = {
  modal: MonitoringGroupModalState | null
  disableDuration: string
  onDisableDurationChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
  t: Translate
}

export function MonitoringGroupToggleDialog({
  modal,
  disableDuration,
  onDisableDurationChange,
  onClose,
  onConfirm,
  t,
}: MonitoringGroupToggleDialogProps) {
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
