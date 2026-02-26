"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchJson } from "@/lib/http"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { PlanningRegleResponse, LieuEmtParams } from "@/lib/planning-regle-schema"
import { WeeklyPlanningView } from "./planning-weekly-view"
import { PlanningRuleFormDialog } from "./planning-rule-form-dialog"

interface PlanningPreviewResponse {
  regleActive: { Id_Regle: number } | null
  consignesAttendues: {
    consigne: number | null
    consigneSup: number | null
    consigneInf: number | null
    toleranceSup: number | null
    toleranceInf: number | null
  }
}

// Explicit key map avoids dynamic template literal key access, required by next-intl static analysis
const DAY_KEYS = {
  1: "dialog.days.1",
  2: "dialog.days.2",
  3: "dialog.days.3",
  4: "dialog.days.4",
  5: "dialog.days.5",
  6: "dialog.days.6",
  7: "dialog.days.7",
} as const

interface LocationFormTabPlanningProps {
  idLieu: number | null // null when creating a new lieu (not yet saved)
  emtParams: LieuEmtParams
  onAddRule?: () => void
  onEditRule?: (regle: PlanningRegleResponse) => void
}

export function LocationFormTabPlanning({
  idLieu,
  emtParams,
  onAddRule,
  onEditRule,
}: LocationFormTabPlanningProps) {
  const t = useTranslations("lieux.planning")
  const tCommon = useTranslations("common")
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmRegle, setDeleteConfirmRegle] = useState<PlanningRegleResponse | null>(null)
  const [retainMode, setRetainMode] = useState<"base" | "regle">("base")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRegle, setEditRegle] = useState<PlanningRegleResponse | null>(null)

  const queryKey = ["planning-regles", idLieu]

  const { data: regles = [], isLoading } = useQuery<PlanningRegleResponse[]>({
    queryKey,
    queryFn: () =>
      fetchJson<PlanningRegleResponse[]>(`/api/lieux/${idLieu}/planning`),
    enabled: !!idLieu,
  })

  const { data: preview } = useQuery<PlanningPreviewResponse | null>({
    queryKey: ["planning-preview", idLieu],
    queryFn: async () => {
      try {
        return await fetchJson<PlanningPreviewResponse>(`/api/lieux/${idLieu}/planning/preview`)
      } catch {
        return null
      }
    },
    enabled: !!idLieu,
    refetchInterval: 60_000,
  })

  const confirmDelete = async () => {
    if (!deleteConfirmRegle || !idLieu) return
    setDeletingId(deleteConfirmRegle.Id_Regle)
    try {
      await fetchJson<void>(
        `/api/lieux/${idLieu}/planning/${deleteConfirmRegle.Id_Regle}?retainMode=${retainMode}`,
        { method: "DELETE", credentials: "include" },
      )
      await queryClient.invalidateQueries({ queryKey })
      void queryClient.invalidateQueries({ queryKey: ["planning-preview", idLieu] })
      setDeleteConfirmRegle(null)
      setRetainMode("base")
    } catch {
      toast.error(t("deleteConfirm.errorDelete"))
    } finally {
      setDeletingId(null)
    }
  }

  if (!idLieu) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("saveFirst")}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => {
            setEditRegle(null)
            setDialogOpen(true)
            onAddRule?.()
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addRule")}
        </Button>
      </div>

      {/* Current status badge */}
      {preview !== undefined && (
        <div className="flex items-center gap-2">
          {preview?.regleActive ? (
            <Badge variant="default" className="bg-green-600">
              {t("activeStatus")} #{preview.regleActive.Id_Regle}
            </Badge>
          ) : (
            <Badge variant="secondary">
              {t("baseStatus")}
            </Badge>
          )}
        </div>
      )}

      {/* Weekly grid view */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <WeeklyPlanningView
          regles={regles}
          onSelectRegle={(regle) => {
            setEditRegle(regle)
            setDialogOpen(true)
            onEditRule?.(regle)
          }}
        />
      )}

      {/* Rule list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      ) : regles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noRules")}</p>
      ) : (
        <div className="space-y-2">
          {regles.map((regle) => (
            <div
              key={regle.Id_Regle}
              className="flex items-start justify-between rounded border bg-card px-3 py-2 gap-2"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                {/* Day range */}
                <span className="text-sm font-medium">
                  {regle.Jour_Debut in DAY_KEYS
                    ? t(DAY_KEYS[regle.Jour_Debut as keyof typeof DAY_KEYS])
                    : regle.Jour_Debut}
                  {" — "}
                  {regle.Jour_Fin in DAY_KEYS
                    ? t(DAY_KEYS[regle.Jour_Fin as keyof typeof DAY_KEYS])
                    : regle.Jour_Fin}
                </span>
                {/* Time range */}
                <span className="text-xs text-muted-foreground">
                  {regle.Heure_Debut} – {regle.Heure_Fin}
                </span>
                {/* Consigne values */}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {regle.Consigne !== null && (
                    <span className="text-xs text-muted-foreground">
                      {t("consigne")}: {regle.Consigne}
                    </span>
                  )}
                  {regle.Consigne_Sup !== null && (
                    <span className="text-xs text-muted-foreground">
                      {t("consigneSup")}: {regle.Consigne_Sup}
                    </span>
                  )}
                  {regle.Consigne_Inf !== null && (
                    <span className="text-xs text-muted-foreground">
                      {t("consigneInf")}: {regle.Consigne_Inf}
                    </span>
                  )}
                </div>
              </div>

              {/* Right side: priority badge + actions */}
              <div className="flex items-center gap-1 shrink-0">
                {regle.Priorite > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {t("priority")}: {regle.Priorite}
                  </Badge>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditRegle(regle)
                    setDialogOpen(true)
                    onEditRule?.(regle)
                  }}
                  title={t("editRule")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirmRegle(regle)}
                  disabled={deletingId === regle.Id_Regle}
                  title={t("deleteRule")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule form dialog — create or edit */}
      {idLieu !== null && (
        <PlanningRuleFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey })
            void queryClient.invalidateQueries({ queryKey: ["planning-preview", idLieu] })
          }}
          idLieu={idLieu}
          editRegle={editRegle}
          emtParams={emtParams}
        />
      )}

      {/* Delete confirm dialog */}
      <AlertDialog
        open={deleteConfirmRegle !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmRegle(null)
            setRetainMode("base")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm.description")}</AlertDialogDescription>
          </AlertDialogHeader>

          <RadioGroup
            value={retainMode}
            onValueChange={(v) => setRetainMode(v as "base" | "regle")}
            className="space-y-3 py-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="base" id="retain-base" />
              <Label htmlFor="retain-base">{t("deleteConfirm.optionBase")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="regle" id="retain-regle" />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="retain-regle">{t("deleteConfirm.optionRegle")}</Label>
                {deleteConfirmRegle && (
                  <span className="text-xs text-muted-foreground">
                    {t("deleteConfirm.ruleValues", {
                      consigne: deleteConfirmRegle.Consigne ?? "—",
                      sup: deleteConfirmRegle.Consigne_Sup ?? "—",
                      inf: deleteConfirmRegle.Consigne_Inf ?? "—",
                    })}
                  </span>
                )}
              </div>
            </div>
          </RadioGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              disabled={deletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteRule")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
