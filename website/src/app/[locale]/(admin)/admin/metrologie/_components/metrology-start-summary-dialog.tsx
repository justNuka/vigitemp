"use client"

import type { ReactNode } from "react"
import { AlertTriangle, Cable, FlaskConical, Network, Thermometer } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type SummarySensor = {
  serialNumber: string
  locationName: string | null
  moduleName: string | null
}

type SummaryStandard = {
  serialNumber: string | null
  type: string | null
  port: string | null
  moduleName: string | null
  networkHost: string | null
}

type Labels = {
  title: string
  description: string
  operation: string
  operator: string
  sensors: string
  standard: string
  standardType: string
  module: string
  connection: string
  medium: string
  interval: string
  unassigned: string
  noModule: string
  noIp: string
  sefConnection: (host: string) => string
  serialConnection: (port: string) => string
  cancel: string
  confirm: string
  confirming: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  pending?: boolean
  operationLabel: string
  operator: string
  sensors: SummarySensor[]
  standard: SummaryStandard | null
  mediumLabel?: string | null
  intervalLabel?: string | null
  labels: Labels
}

function ValueRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="min-w-0 text-sm font-medium">{value}</div>
    </div>
  )
}

export function MetrologyStartSummaryDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
  operationLabel,
  operator,
  sensors,
  standard,
  mediumLabel,
  intervalLabel,
  labels,
}: Props) {
  const standardType = standard?.type?.trim().toUpperCase() || "-"
  const isSef = standardType === "SEF"
  const hasExplicitModule = Boolean(standard?.moduleName)
  const hasSefHost = Boolean(standard?.networkHost?.trim())

  const connection = isSef
    ? hasSefHost
      ? labels.sefConnection(standard!.networkHost!.trim())
      : labels.noIp
    : standard?.port?.trim()
      ? labels.serialConnection(standard.port.trim())
      : "-"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.title}</AlertDialogTitle>
          <AlertDialogDescription>{labels.description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="space-y-3">
              <ValueRow label={labels.operation} value={operationLabel} />
              <ValueRow label={labels.operator} value={operator || "-"} />
              {mediumLabel ? <ValueRow label={labels.medium} value={mediumLabel} /> : null}
              {intervalLabel ? <ValueRow label={labels.interval} value={intervalLabel} /> : null}
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span className="font-semibold">{labels.standard}</span>
            </div>
            <div className="space-y-3">
              <ValueRow label={labels.standard} value={standard?.serialNumber || "-"} />
              <ValueRow label={labels.standardType} value={<Badge variant="secondary">{standardType}</Badge>} />
              <ValueRow
                label={labels.module}
                value={
                  <span className={!hasExplicitModule && isSef ? "text-destructive" : undefined}>
                    {standard?.moduleName || labels.noModule}
                  </span>
                }
              />
              <ValueRow
                label={labels.connection}
                value={
                  <span className="inline-flex items-center gap-2">
                    {isSef ? <Network className="h-4 w-4" /> : <Cable className="h-4 w-4" />}
                    <span className={isSef && !hasSefHost ? "text-destructive" : undefined}>{connection}</span>
                  </span>
                }
              />
            </div>

            {isSef && (!hasExplicitModule || !hasSefHost) ? (
              <div className="mt-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{!hasExplicitModule ? labels.noModule : labels.noIp}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="font-semibold">{labels.sensors}</span>
              <Badge variant="outline">{sensors.length}</Badge>
            </div>
            <Separator className="mb-3" />
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {sensors.map((sensor) => (
                <div key={sensor.serialNumber} className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
                  <div className="font-medium">{sensor.serialNumber}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[sensor.locationName || labels.unassigned, sensor.moduleName].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{labels.cancel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || (isSef && (!hasExplicitModule || !hasSefHost))}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {pending ? labels.confirming : labels.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
