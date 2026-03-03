import { Check, X } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { JourOption, PlanningRegleFormValues } from "./planning-rule-form-helpers"

function NumberInputField({
  form,
  name,
  label,
  placeholder,
  integer = false,
  minZero = false,
}: {
  form: UseFormReturn<PlanningRegleFormValues, unknown, any>
  name: keyof PlanningRegleFormValues
  label: string
  placeholder?: string
  integer?: boolean
  minZero?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={minZero ? "0" : undefined}
              step={integer ? "1" : "any"}
              placeholder={placeholder}
              value={field.value ?? ""}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === "") {
                  field.onChange(name === "Priorite" ? 0 : null)
                  return
                }

                const parsed = integer ? Math.trunc(Number(raw)) : Number(raw)
                field.onChange(minZero ? Math.max(0, parsed) : parsed)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function PlanningRuleScheduleFields({
  form,
  tDialog,
  joursOptions,
}: {
  form: UseFormReturn<PlanningRegleFormValues, unknown, any>
  tDialog: (key: string) => string
  joursOptions: JourOption[]
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="Jour_Debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tDialog("labelJourDebut")}</FormLabel>
              <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={tDialog("placeholderJour")} />
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="Jour_Fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tDialog("labelJourFin")}</FormLabel>
              <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={tDialog("placeholderJour")} />
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
    </>
  )
}

export function PlanningRuleThresholdFields({
  form,
  tDialog,
}: {
  form: UseFormReturn<PlanningRegleFormValues, unknown, any>
  tDialog: (key: string) => string
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <NumberInputField form={form} name="Consigne" label={tDialog("labelConsigne")} placeholder={tDialog("placeholderNumeric")} />
        <NumberInputField form={form} name="Priorite" label={tDialog("labelPriorite")} integer />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberInputField form={form} name="Consigne_Sup" label={tDialog("labelConsigneSup")} placeholder={tDialog("placeholderNumeric")} />
        <NumberInputField form={form} name="Consigne_Inf" label={tDialog("labelConsigneInf")} placeholder={tDialog("placeholderNumeric")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberInputField
          form={form}
          name="Retard_Alarme_Changement_Consigne"
          label={tDialog("labelRetardChangementConsigne")}
          placeholder={tDialog("placeholderRetardChangementConsigne")}
          integer
          minZero
        />
      </div>
    </>
  )
}

export function PlanningRuleEmtSummary({
  tDialog,
  emtPreview,
  emtModeLabel,
  emtMode,
  correctAccuracyError,
  includeDeriveInUncertainty,
}: {
  tDialog: (key: string) => string
  emtPreview: { emtSonde: number | null; toleranceSup: number | null; toleranceInf: number | null }
  emtModeLabel: string
  emtMode: string
  correctAccuracyError: boolean
  includeDeriveInUncertainty: boolean
}) {
  return (
    <div className="rounded-md border bg-muted/40 p-3 space-y-2 text-sm">
      <p className="font-medium">{tDialog("emtTitle")}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
        <span>
          {tDialog("emtMode")}: <span className="text-foreground font-medium">{emtModeLabel ?? emtMode}</span>
        </span>
        {emtPreview.emtSonde !== null ? (
          <span>
            {tDialog("emtSonde")}: <span className="text-foreground font-medium">{emtPreview.emtSonde.toFixed(4)}</span>
          </span>
        ) : null}
        <span>
          {correctAccuracyError ? <Check className="inline h-3 w-3 text-green-600" /> : <X className="inline h-3 w-3 text-muted-foreground" />} {tDialog("emtCorrectEj")}
        </span>
        <span>
          {includeDeriveInUncertainty ? <Check className="inline h-3 w-3 text-green-600" /> : <X className="inline h-3 w-3 text-muted-foreground" />} {tDialog("emtDerive")}
        </span>
      </div>
      <div className="border-t pt-2 flex flex-wrap gap-x-6 gap-y-1">
        <span className="text-muted-foreground">
          {tDialog("emtToleranceSup")}: <span className="text-foreground font-medium">{emtPreview.toleranceSup !== null ? emtPreview.toleranceSup.toFixed(4) : tDialog("emtNotCalculable")}</span>
        </span>
        <span className="text-muted-foreground">
          {tDialog("emtToleranceInf")}: <span className="text-foreground font-medium">{emtPreview.toleranceInf !== null ? emtPreview.toleranceInf.toFixed(4) : tDialog("emtNotCalculable")}</span>
        </span>
      </div>
    </div>
  )
}

export function PlanningRuleActiveField({
  form,
  tDialog,
}: {
  form: UseFormReturn<PlanningRegleFormValues, unknown, any>
  tDialog: (key: string) => string
}) {
  return (
    <FormField
      control={form.control}
      name="Actif"
      render={({ field }) => (
        <FormItem className="flex items-center gap-2 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
          </FormControl>
          <FormLabel className="cursor-pointer">{tDialog("labelActif")}</FormLabel>
        </FormItem>
      )}
    />
  )
}
