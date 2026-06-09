"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { patchJson, postJson } from "@/lib/http"
import { showFormValidationToast } from "@/lib/form-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { IntercomparisonMedium } from "@/hooks/useIntercomparisonMedia"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  medium?: IntercomparisonMedium | null
}

type Values = {
  Model: string
  Reference: string
  Stabilite?: string
  Homogeneite?: string
  Contenu?: string
}

export function IntercomparisonMediumModal({ open, onOpenChange, medium }: Props) {
  const t = useTranslations("metrologyAdmin.intercomparisonModal")
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const schema = useMemo(() => z.object({
    Model: z.string().min(1, t("validation.modelRequired")),
    Reference: z.string().min(1, t("validation.referenceRequired")),
    Stabilite: z.string().optional(),
    Homogeneite: z.string().optional(),
    Contenu: z.string().optional(),
  }), [t])

  const defaultValues = useMemo<Values>(
    () => ({
      Model: medium?.Model || "",
      Reference: medium?.Reference || "",
      Stabilite: medium?.Stabilite?.toString() || "",
      Homogeneite: medium?.Homogeneite?.toString() || "",
      Contenu: medium?.Contenu || "",
    }),
    [medium],
  )

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [defaultValues, form, open])

  async function handleSubmit(values: Values) {
    setIsLoading(true)
    try {
      const payload = {
        ...values,
        Stabilite: values.Stabilite?.trim() ? values.Stabilite : null,
        Homogeneite: values.Homogeneite?.trim() ? values.Homogeneite : null,
      }

      if (medium?.Id_Milieu) {
        await patchJson(`/api/metrologie/milieux/${medium.Id_Milieu}`, payload)
      } else {
        await postJson("/api/metrologie/milieux", payload)
      }

      toast.success(medium ? t("toast.updated") : t("toast.created"))
      queryClient.invalidateQueries({ queryKey: ["metrology-intercomparison-media"] })
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{medium ? t("titleEdit") : t("titleCreate")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="Model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.model")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.reference")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Stabilite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.stability")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Homogeneite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.homogeneity")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Contenu"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("fields.content")}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              {t("hint")}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("actions.saving") : medium ? t("actions.update") : t("actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
