"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getJson, patchJson } from "@/lib/http"
import { useStandards, type Standard } from "@/hooks/useStandards"
import { useStandardTypes } from "@/hooks/useStandardTypes"
import { StandardModal } from "../etalons/standard-modal"
import { Plus, RefreshCcw, TestTube2 } from "lucide-react"
import { useTranslations } from "next-intl"

type SettingResponse = {
  key: string
  value: string
}

const ASSIGNED_STANDARD_KEY = "tools:assigned_standard_serial"

function getStandardTypeCode(standard: Standard) {
  const serial = standard.Etalon_Numero_Serie ?? ""
  return serial.slice(0, 4)
}

export function StandardReaderTab() {
  const t = useTranslations("toolsPage.standard_reader")
    const queryClient = useQueryClient()
  const { data: standards = [], isLoading } = useStandards()
  const { data: standardTypes = [] } = useStandardTypes(true)
  const [selectedSerial, setSelectedSerial] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const assignedQuery = useQuery({
    queryKey: ["tool-standard-assignment"],
    queryFn: async () => {
      try {
        return await getJson<SettingResponse>(`/api/parametres/${ASSIGNED_STANDARD_KEY}`)
      } catch {
        return null
      }
    },
  })

  const eligibleStandards = useMemo(() => {
    return standards.filter((standard) => {
      const hasCertificate = Boolean(standard.Date_Certif || standard.Num_Certif || standard.Organisme)
      return hasCertificate && !standard.Est_Archive
    })
  }, [standards])

  useEffect(() => {
    const assignedValue = assignedQuery.data?.value
    if (!assignedValue) return

    const syncTimer = window.setTimeout(() => {
      setSelectedSerial(assignedValue)
    }, 0)

    return () => {
      window.clearTimeout(syncTimer)
    }
  }, [assignedQuery.data?.value])

  const assignedStandard = useMemo(() => {
    return eligibleStandards.find((standard) => standard.Etalon_Numero_Serie === selectedSerial) ?? null
  }, [eligibleStandards, selectedSerial])

  const assignedType = useMemo(() => {
    if (!assignedStandard) return null
    const code = getStandardTypeCode(assignedStandard)
    return standardTypes.find((type) => type.Type_Etalon === code) ?? null
  }, [assignedStandard, standardTypes])

  const saveAssignmentMutation = useMutation({
    mutationFn: async (serial: string) => patchJson(`/api/parametres/${ASSIGNED_STANDARD_KEY}`, { value: serial }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tool-standard-assignment"] })
      toast.success(t("toasts.assign_success"))
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("toasts.assign_error"))
    },
  })

  const clearAssignmentMutation = useMutation({
    mutationFn: async () => patchJson(`/api/parametres/${ASSIGNED_STANDARD_KEY}`, { value: "" }),
    onSuccess: async () => {
      setSelectedSerial("")
      await queryClient.invalidateQueries({ queryKey: ["tool-standard-assignment"] })
      toast.success(t("toasts.clear_success"))
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("toasts.assign_error"))
    },
  })

  const handleAssign = () => {
    if (!selectedSerial) return
    saveAssignmentMutation.mutate(selectedSerial)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            {t("helper")}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-xl border bg-card p-4">
              <div className="space-y-2">
                <Label>{t("select_label")}</Label>
                <Select value={selectedSerial} onValueChange={setSelectedSerial}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleStandards.map((standard) => (
                      <SelectItem key={standard.Id_Etalon} value={standard.Etalon_Numero_Serie ?? String(standard.Id_Etalon)}>
                        {standard.Etalon_Numero_Serie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("eligible_count", { count: eligibleStandards.length })}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleAssign} disabled={!selectedSerial || saveAssignmentMutation.isPending} className="gap-2">
                  <TestTube2 className="h-4 w-4" />
                  {t("actions.assign")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("actions.create_standard")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void queryClient.invalidateQueries({ queryKey: ["etalons"] })
                    void queryClient.invalidateQueries({ queryKey: ["etalon-types"] })
                  }}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {t("actions.refresh")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => clearAssignmentMutation.mutate()}
                  disabled={!assignedQuery.data?.value || clearAssignmentMutation.isPending}
                >
                  {t("actions.clear")}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{t("assigned_title")}</h3>
                {assignedStandard ? (
                  <Badge className="bg-green-600 hover:bg-green-600">{t("assigned_badge")}</Badge>
                ) : (
                  <Badge variant="secondary">{t("unassigned_badge")}</Badge>
                )}
              </div>

              <Separator className="my-4" />

              {assignedStandard ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("fields.serial")}</p>
                    <p className="font-medium">{assignedStandard.Etalon_Numero_Serie}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.type")}</p>
                    <p className="font-medium">{assignedType?.Nom || getStandardTypeCode(assignedStandard) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.certificate")}</p>
                    <p className="font-medium">{assignedStandard.Num_Certif || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.organization")}</p>
                    <p className="font-medium">{assignedStandard.Organisme || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.date")}</p>
                    <p className="font-medium">{assignedStandard.Date_Certif ? assignedStandard.Date_Certif.slice(0, 10) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.unit")}</p>
                    <p className="font-medium">{assignedStandard.Unite || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.resolution")}</p>
                    <p className="font-medium">{assignedStandard.Resolution || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("fields.incertitude")}</p>
                    <p className="font-medium">{assignedStandard.Incertitude || "-"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-sm text-muted-foreground">{t("empty")}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <StandardModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  )
}

