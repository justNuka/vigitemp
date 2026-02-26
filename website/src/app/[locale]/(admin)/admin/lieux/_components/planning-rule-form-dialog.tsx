"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { computeEmt } from "@/lib/emt"
import { showFormValidationToast } from "@/lib/form-toast"
import { z } from "zod"
import {
  planningRegleCreateSchema,
  type PlanningRegleCreate,
  type PlanningRegleResponse,
  type LieuEmtParams,
} from "@/lib/planning-regle-schema"

// Form field values type — uses z.input so that fields with .default() are optional
// allowing react-hook-form to manage them as optional until zod fills defaults
type PlanningRegleFormValues = z.input<typeof planningRegleCreateSchema>

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface PlanningRuleFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  idLieu: number
  editRegle?: PlanningRegleResponse | null
  emtParams: LieuEmtParams
}

// -------------------------------------------------------------------------
// Day select option type
// -------------------------------------------------------------------------

interface JourOption {
  value: number
  label: string
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

export function PlanningRuleFormDialog({
  open,
  onClose,
  onSuccess,
  idLieu,
  editRegle,
  emtParams,
}: PlanningRuleFormDialogProps) {
  const tCommon = useTranslations("common")
  const tDialog = useTranslations("lieux.planning.dialog")

  const isEdit = !!editRegle

  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build day options with explicit i18n keys (avoids dynamic template literal key access)
  const joursOptions: JourOption[] = [
    { value: 1, label: tDialog("days.1") },
    { value: 2, label: tDialog("days.2") },
    { value: 3, label: tDialog("days.3") },
    { value: 4, label: tDialog("days.4") },
    { value: 5, label: tDialog("days.5") },
    { value: 6, label: tDialog("days.6") },
    { value: 7, label: tDialog("days.7") },
  ]

  const form = useForm<PlanningRegleFormValues, unknown, PlanningRegleCreate>({
    resolver: zodResolver(planningRegleCreateSchema),
    defaultValues: {
      Actif: true,
      Jour_Debut: 1,
      Heure_Debut: "08:00",
      Jour_Fin: 5,
      Heure_Fin: "18:00",
      Consigne: null,
      Consigne_Sup: null,
      Consigne_Inf: null,
      Priorite: 0,
    },
  })

  // Reset form whenever the dialog opens or editRegle changes
  useEffect(() => {
    if (!open) return

    if (isEdit && editRegle) {
      form.reset({
        Actif: editRegle.Actif,
        Jour_Debut: editRegle.Jour_Debut,
        Heure_Debut: editRegle.Heure_Debut,
        Jour_Fin: editRegle.Jour_Fin,
        Heure_Fin: editRegle.Heure_Fin,
        Consigne: editRegle.Consigne ?? null,
        Consigne_Sup: editRegle.Consigne_Sup ?? null,
        Consigne_Inf: editRegle.Consigne_Inf ?? null,
        Priorite: editRegle.Priorite,
      })
    } else {
      form.reset({
        Actif: true,
        Jour_Debut: 1,
        Heure_Debut: "08:00",
        Jour_Fin: 5,
        Heure_Fin: "18:00",
        Consigne: null,
        Consigne_Sup: null,
        Consigne_Inf: null,
        Priorite: 0,
      })
    }

    setSubmitError(null)
  }, [open, isEdit, editRegle, form])

  const handleSubmit = async (data: PlanningRegleCreate) => {
    setSubmitError(null)
    const url = isEdit
      ? `/api/lieux/${idLieu}/planning/${editRegle!.Id_Regle}`
      : `/api/lieux/${idLieu}/planning`
    const method = isEdit ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success(
          isEdit
            ? tDialog("titleEdit")
            : tDialog("titleCreate"),
        )
        onSuccess()
        onClose()
      } else {
        const errorMessage = tDialog("errorSave")
        setSubmitError(errorMessage)
        toast.error(errorMessage)
      }
    } catch {
      const errorMessage = tDialog("errorSave")
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  const watchedConsigne = form.watch("Consigne")
  const watchedConsigneSup = form.watch("Consigne_Sup")
  const watchedConsigneInf = form.watch("Consigne_Inf")

  const emtPreview = useMemo(
    () =>
      computeEmt({
        ...emtParams,
        consigne: watchedConsigne ?? null,
        consigneSup: watchedConsigneSup ?? null,
        consigneInf: watchedConsigneInf ?? null,
      }),
    [emtParams, watchedConsigne, watchedConsigneSup, watchedConsigneInf],
  )

  const EMT_MODE_LABEL: Record<string, string> = {
    quart: tDialog("emtModeQuart"),
    manuel: tDialog("emtModeManuel"),
    uncertainties: tDialog("emtModeUncertainties"),
    "sans-objet": tDialog("emtModeSansObjet"),
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? tDialog("titleEdit") : tDialog("titleCreate")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              handleSubmit,
              (errors) => showFormValidationToast(errors),
            )}
            className="space-y-4"
          >
            {/* Row: Jour_Debut + Heure_Debut */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Jour_Debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelJourDebut")}</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={tDialog("placeholderJour")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {joursOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Heure_Debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelHeureDebut")}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: Jour_Fin + Heure_Fin */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Jour_Fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelJourFin")}</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={tDialog("placeholderJour")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {joursOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Heure_Fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelHeureFin")}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: Consigne + Priorite */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Consigne"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelConsigne")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={tDialog("placeholderNumeric")}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value
                          field.onChange(
                            raw === "" ? null : Number(raw),
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Priorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelPriorite")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value, 10),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row: Consigne_Sup + Consigne_Inf */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Consigne_Sup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelConsigneSup")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={tDialog("placeholderNumeric")}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value
                          field.onChange(
                            raw === "" ? null : Number(raw),
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Consigne_Inf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tDialog("labelConsigneInf")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={tDialog("placeholderNumeric")}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value
                          field.onChange(
                            raw === "" ? null : Number(raw),
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* EMT summary block */}
            <div className="rounded-md border bg-muted/40 p-3 space-y-2 text-sm">
              <p className="font-medium">{tDialog("emtTitle")}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                <span>
                  {tDialog("emtMode")}:{" "}
                  <span className="text-foreground font-medium">
                    {EMT_MODE_LABEL[emtParams.mode] ?? emtParams.mode}
                  </span>
                </span>
                {emtPreview.emtSonde !== null && (
                  <span>
                    {tDialog("emtSonde")}:{" "}
                    <span className="text-foreground font-medium">
                      {emtPreview.emtSonde.toFixed(4)}
                    </span>
                  </span>
                )}
                <span>
                  {emtParams.correctAccuracyError
                    ? <Check className="inline h-3 w-3 text-green-600" />
                    : <X className="inline h-3 w-3 text-muted-foreground" />
                  }{" "}{tDialog("emtCorrectEj")}
                </span>
                <span>
                  {emtParams.includeDeriveInUncertainty
                    ? <Check className="inline h-3 w-3 text-green-600" />
                    : <X className="inline h-3 w-3 text-muted-foreground" />
                  }{" "}{tDialog("emtDerive")}
                </span>
              </div>
              <div className="border-t pt-2 flex flex-wrap gap-x-6 gap-y-1">
                <span className="text-muted-foreground">
                  {tDialog("emtToleranceSup")}:{" "}
                  <span className="text-foreground font-medium">
                    {emtPreview.toleranceSup !== null
                      ? emtPreview.toleranceSup.toFixed(4)
                      : tDialog("emtNotCalculable")}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {tDialog("emtToleranceInf")}:{" "}
                  <span className="text-foreground font-medium">
                    {emtPreview.toleranceInf !== null
                      ? emtPreview.toleranceInf.toFixed(4)
                      : tDialog("emtNotCalculable")}
                  </span>
                </span>
              </div>
            </div>

            {/* Checkbox: Actif */}
            <FormField
              control={form.control}
              name="Actif"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    {tDialog("labelActif")}
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Error message */}
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Check className="h-4 w-4" />
                {isSubmitting ? tDialog("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
