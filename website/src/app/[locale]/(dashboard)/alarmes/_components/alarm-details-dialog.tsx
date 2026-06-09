import { AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'

import MonitoringDetailsModal from '@/components/monitoring-details-modal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { AlarmWithDetails } from '@/lib/api'

const hasConfiguredThresholds = (alarm: { sensor: AlarmWithDetails['sensor'] }): boolean => {
  const sensorWithMeta = alarm.sensor as AlarmWithDetails['sensor'] & { hasThresholds?: boolean }
  return sensorWithMeta.hasThresholds !== false
}

function formatAlarmNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "-"
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded)
}

function formatAlarmValue(value: number | null | undefined, unit: string | null | undefined) {
  const formatted = formatAlarmNumber(value)
  if (formatted === "-") return formatted
  return `${formatted} ${unit ?? ""}`.trim()
}

export function AlarmDetailsDialog({
  selectedAlarm,
  open,
  showGraph,
  setShowGraph,
  commentOptions,
  isCommentsLoading,
  selectedCommentId,
  setSelectedCommentId,
  setValue,
  register,
  errors,
  comment,
  handleSubmit,
  handleDialogAcknowledge,
  canAcknowledgeAlarm,
  acknowledgePending,
  isSubmitting,
  t,
  alarmTypeLabel,
  formattedStart,
  formattedEnd,
  formattedDuration,
  isStatsLoading,
  alarmCount30,
  focusRange,
  onClose,
}: any) {
  const formattedLastValue = useMemo(() => {
    return formatAlarmValue(selectedAlarm?.sensor.currentValue ?? selectedAlarm?.value ?? null, selectedAlarm?.sensor.unit)
  }, [selectedAlarm])
  const formattedSupThreshold = useMemo(() => formatAlarmNumber(selectedAlarm?.sensor.maxThreshold ?? null), [selectedAlarm])
  const formattedInfThreshold = useMemo(() => formatAlarmNumber(selectedAlarm?.sensor.minThreshold ?? null), [selectedAlarm])

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[92dvh] overflow-y-auto border-border bg-white shadow-2xl dark:bg-popover dark:text-popover-foreground">
          <DialogHeader className="pb-3 border-b border-border/50">
            <DialogTitle className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </span>
              {t('dialog.title')}
            </DialogTitle>
            {selectedAlarm ? (
              <DialogDescription className="pl-12">
                <span className="block font-medium text-foreground/80">{selectedAlarm.location.name}</span>
                <span className="block text-muted-foreground">{selectedAlarm.sensor.name}</span>
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 dark:bg-muted/20 md:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.type_label')}</p><p className="text-sm font-medium">{alarmTypeLabel}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.last_value_label')}</p><p className="text-sm font-mono font-semibold text-primary">{formattedLastValue}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.start_label')}</p><p className="text-sm font-medium">{formattedStart}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.end_label')}</p><p className="text-sm font-medium">{formattedEnd}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.duration_label')}</p><p className="text-sm font-medium">{formattedDuration}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.count_30_label')}</p><p className="text-sm font-medium">{isStatsLoading ? t('dialog.loading') : alarmCount30 !== null ? t('dialog.count_30_value', { count: alarmCount30 }) : t('dialog.na')}</p></div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{t('dialog.thresholds_label')}</p>
                <p className="text-sm font-mono text-muted-foreground">{selectedAlarm && hasConfiguredThresholds(selectedAlarm) ? t('dialog.sup_value', { value: formattedSupThreshold, unit: selectedAlarm.sensor.unit ?? '' }) : '-'}</p>
                <p className="text-sm font-mono text-muted-foreground">{selectedAlarm && hasConfiguredThresholds(selectedAlarm) ? t('dialog.inf_value', { value: formattedInfThreshold, unit: selectedAlarm.sensor.unit ?? '' }) : '-'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-3 dark:bg-muted/10">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t('dialog.graph_label')}</p>
                <p className="text-xs text-muted-foreground">{t('dialog.graph_hint')}</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setShowGraph((prev: boolean) => !prev)}>
                {showGraph ? t('dialog.graph_hide') : t('dialog.graph_show')}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="comment-template">{t('dialog.comment_select_label')}</label>
              <Select
                value={selectedCommentId}
                onValueChange={(value) => {
                  setSelectedCommentId(value)
                  const selected = commentOptions.find((item: { id: number; text: string }) => String(item.id) === value)
                  if (selected) {
                    setValue('comment', selected.text, { shouldDirty: true, shouldTouch: true })
                  }
                }}
                disabled={isCommentsLoading}
              >
                <SelectTrigger id="comment-template"><SelectValue placeholder={t('dialog.comment_select_placeholder')} /></SelectTrigger>
                <SelectContent>
                  {commentOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>{t('dialog.comment_select_empty')}</SelectItem>
                  ) : (
                    commentOptions.map((option: { id: number; text: string }) => <SelectItem key={option.id} value={String(option.id)}>{option.text}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">{t('dialog.comment_label')}</label>
              <Textarea id="comment" placeholder={t('dialog.comment_placeholder')} {...register('comment')} maxLength={200} rows={4} aria-invalid={!!errors.comment} aria-describedby={errors.comment ? 'comment-error' : undefined} data-testid="input-alarm-comment" />
              {errors.comment?.message ? <p id="comment-error" className="text-sm text-destructive">{String(errors.comment.message)}</p> : null}
              <p className="text-xs text-muted-foreground text-right">{t('dialog.comment_count', { count: comment.length })}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-acknowledge">{t('dialog.cancel')}</Button>
            {canAcknowledgeAlarm ? (
              <Button onClick={handleSubmit(handleDialogAcknowledge)} disabled={acknowledgePending || isSubmitting} data-testid="button-confirm-acknowledge">
                {acknowledgePending ? t('dialog.confirming') : t('dialog.confirm')}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedAlarm && showGraph ? (
        <MonitoringDetailsModal
          isOpen={showGraph}
          onClose={() => setShowGraph(false)}
          idLieu={Number(selectedAlarm.locationId)}
          nomLieu={selectedAlarm.location.name}
          sondeNumeroSerie={selectedAlarm.sensor.name}
          consigneSup={selectedAlarm.sensor.maxThreshold ?? null}
          consigneInf={selectedAlarm.sensor.minThreshold ?? null}
          consigne={selectedAlarm.threshold ?? null}
          unite={selectedAlarm.sensor.unit}
          isSurveillanceActive={true}
          initialRange={focusRange ?? undefined}
        />
      ) : null}
    </>
  )
}
