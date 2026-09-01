"use client"

import { Mail, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { QuantityStepper } from "./quantity-stepper"

function renderGammeLabel(label: string) {
  const [prefix, suffix] = label.split(" ")
  if (!suffix) return label

  return (
    <span>
      <span className="text-[hsl(var(--sidebar))] dark:text-white">{prefix}</span>{" "}
      <span className="text-primary">{suffix}</span>
    </span>
  )
}

type SummaryItem = {
  materialId: number
  refCommercial: string
  designation: string
  gamme: string
  rawGamme: string
  rawType: string
  typeLabel: string
  isModule: boolean
  family: string
  kind: string
  quantity: number
}

type HardwareOrderSummaryProps = {
  items: SummaryItem[]
  comment: string
  totalQuantity: number
  commercialEmail: string
  customerId: string | null
  smtpReady: boolean
  labels: {
    title: string
    empty: string
    quantity: string
    comment: string
    commentPlaceholder: string
    totalItems: string
    customerNumber: string
    customerNumberEmpty: string
    totalReferences: string
    modules: string
    sensors: string
    emailDelivery: string
    mailtoDelivery: string
    savePdf: string
    submit: string
    remove: string
  }
  onCommentChange: (value: string) => void
  onQuantityChange: (materialId: number, quantity: number) => void
  onRemove: (materialId: number) => void
  onSavePdf: () => void
  onSubmit: () => void
  busy?: boolean
  className?: string
}

export function HardwareOrderSummary({
  items,
  comment,
  totalQuantity,
  commercialEmail,
  customerId,
  smtpReady,
  labels,
  onCommentChange,
  onQuantityChange,
  onRemove,
  onSavePdf,
  onSubmit,
  busy = false,
  className,
}: HardwareOrderSummaryProps) {
  const typeOrder: Record<string, number> = {
    RADIO: 1,
    ETALON: 2,
    ETHERNET: 3,
    FILAIRE: 4,
  }

  const groupedItems = Object.values(
    items.reduce<
      Record<
        string,
        {
          gamme: string
          rawGamme: string
          modules: SummaryItem[]
          sensors: SummaryItem[]
          byType: Record<string, { label: string; modules: SummaryItem[]; sensors: SummaryItem[] }>
        }
      >
    >((acc, item) => {
      const gammeKey = item.rawGamme || item.gamme
      if (!acc[gammeKey]) {
        acc[gammeKey] = {
          gamme: item.gamme,
          rawGamme: item.rawGamme,
          modules: [],
          sensors: [],
          byType: {},
        }
      }

      const gammeGroup = acc[gammeKey]
      if (gammeKey === "GSO") {
        if (item.isModule) gammeGroup.modules.push(item)
        else gammeGroup.sensors.push(item)
        return acc
      }

      const typeKey = item.rawType || "AUTRES"
      if (!gammeGroup.byType[typeKey]) {
        gammeGroup.byType[typeKey] = {
          label: item.typeLabel,
          modules: [],
          sensors: [],
        }
      }

      if (item.isModule) gammeGroup.byType[typeKey].modules.push(item)
      else gammeGroup.byType[typeKey].sensors.push(item)

      return acc
    }, {}),
  ).map((group) => ({
    ...group,
    modules: group.modules.sort((a, b) => a.designation.localeCompare(b.designation, "fr")),
    sensors: group.sensors.sort((a, b) => a.designation.localeCompare(b.designation, "fr")),
    typeGroups: Object.entries(group.byType)
      .sort((a, b) => (typeOrder[a[0]] ?? 99) - (typeOrder[b[0]] ?? 99))
      .map(([key, value]) => ({
        key,
        label: value.label,
        modules: value.modules.sort((a, b) => a.designation.localeCompare(b.designation, "fr")),
        sensors: value.sensors.sort((a, b) => a.designation.localeCompare(b.designation, "fr")),
      })),
  }))

  const renderItem = (item: SummaryItem) => (
    <div
      key={item.materialId}
      className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4 dark:border-border dark:bg-card/90"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {item.refCommercial}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{item.designation}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.kind}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.materialId)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{labels.remove}</span>
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {labels.quantity}
        </span>
        <QuantityStepper
          value={item.quantity}
          onChange={(value) => onQuantityChange(item.materialId, value)}
        />
      </div>
    </div>
  )

  return (
    <aside
      className={cn(
        "max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[2rem] border border-border/60 bg-card/95 p-6 shadow-[0_20px_80px_-45px_rgba(15,23,42,0.4)] backdrop-blur",
        "dark:border-border dark:bg-popover/95 dark:shadow-[0_20px_90px_-45px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">MC2</p>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {labels.title}
          </h2>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right dark:bg-cyan-500/15">
          <p className="text-xs uppercase tracking-[0.18em] text-primary">{labels.totalItems}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{totalQuantity}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {labels.empty}
          </div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.rawGamme} className="space-y-4 rounded-2xl border border-border/70 bg-muted/15 p-4 dark:border-border dark:bg-card/85">
              <div className="border-b border-border/60 pb-2">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {renderGammeLabel(group.gamme)}
                </p>
              </div>

              {group.rawGamme === "GSO" ? (
                <div className="space-y-4">
                  {group.modules.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {labels.modules}
                      </p>
                      {group.modules.map(renderItem)}
                    </div>
                  ) : null}

                  {group.sensors.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {labels.sensors}
                      </p>
                      {group.sensors.map(renderItem)}
                    </div>
                  ) : null}
                </div>
              ) : (
                group.typeGroups.map((typeGroup) => (
                  <div key={`${group.rawGamme}-${typeGroup.key}`} className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {typeGroup.label}
                    </p>

                    {typeGroup.modules.length > 0 ? (
                      <div className="space-y-3 pl-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                          {labels.modules}
                        </p>
                        {typeGroup.modules.map(renderItem)}
                      </div>
                    ) : null}

                    {typeGroup.sensors.length > 0 ? (
                      <div className="space-y-3 pl-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                          {labels.sensors}
                        </p>
                        {typeGroup.sensors.map(renderItem)}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-primary/15 bg-[linear-gradient(180deg,rgba(25,145,201,0.09),rgba(25,145,201,0.02))] p-4 text-sm dark:border-cyan-500/20 dark:bg-[linear-gradient(180deg,rgba(6,182,212,0.12),rgba(15,23,42,0.38))]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{labels.customerNumber}</span>
          <span className="font-semibold text-foreground">
            {customerId?.trim() || labels.customerNumberEmpty}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{labels.totalReferences}</span>
          <span className="font-semibold text-foreground">{items.length}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{labels.quantity}</span>
          <span className="font-semibold text-foreground">{totalQuantity}</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium text-foreground">{labels.comment}</label>
        <Textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder={labels.commentPlaceholder}
          className="min-h-28 resize-none"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-muted/25 px-4 py-4 text-sm dark:border-border dark:bg-muted/20">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">{smtpReady ? labels.emailDelivery : labels.mailtoDelivery}</p>
            <p className="text-muted-foreground">{commercialEmail}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <Button type="button" variant="outline" onClick={onSavePdf} disabled={busy || items.length === 0}>
          {labels.savePdf}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={busy || items.length === 0}>
          {labels.submit}
        </Button>
      </div>
    </aside>
  )
}
