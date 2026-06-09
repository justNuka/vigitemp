"use client"

import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react"
import { ArrowRight, BadgeInfo, ChevronLeft, FlaskConical, GaugeCircle, Waves } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { TanStackTable } from "@/components/data-table/tanstack-table"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppAccess } from "@/components/access/app-access-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectEmpty, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdjustmentSensors } from "@/hooks/useAdjustmentSensors"
import { useIntercomparisonMedia } from "@/hooks/useIntercomparisonMedia"
import { useModules } from "@/hooks/useModules"
import { useStandards } from "@/hooks/useStandards"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

type Step = "selection" | "adjustment"

export function AdjustmentWorkflowClient() {
  const t = useTranslations("metrologyAdmin.adjustmentPage")
  const locale = useLocale()
  const { user } = useAppAccess()
  const { data: sensors = [], isLoading: isSensorsLoading } = useAdjustmentSensors()
  const { data: standards = [], isLoading: isStandardsLoading } = useStandards()
  const { data: media = [], isLoading: isMediaLoading } = useIntercomparisonMedia(true)
  const { data: modules = [] } = useModules(true)

  const [selectedSensorIds, setSelectedSensorIds] = useState<number[]>([])
  const [step, setStep] = useState<Step>("selection")
  const [direction, setDirection] = useState(1)
  const [operator, setOperator] = useState("")
  const [displayDecimals, setDisplayDecimals] = useState("2")
  const [selectedStandardId, setSelectedStandardId] = useState<string>("")
  const [isExternalStandard, setIsExternalStandard] = useState(false)
  const [selectedMediumId, setSelectedMediumId] = useState<string>("")
  const [stabilityPlateauDuration, setStabilityPlateauDuration] = useState("30")
  const [stabilityPlateauMaxGap, setStabilityPlateauMaxGap] = useState("0.2")
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentDateTime(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (operator.trim().length > 0) return
    const fullName = [user?.Prenom, user?.Nom].filter(Boolean).join(" ").trim()
    setOperator(fullName || user?.Login || "")
  }, [operator, user?.Login, user?.Nom, user?.Prenom])

  const selectedStandard = useMemo(
    () => standards.find((item) => String(item.Id_Etalon) === selectedStandardId) ?? null,
    [selectedStandardId, standards],
  )

  const selectedModule = useMemo(() => {
    if (!selectedStandard?.Id_Module) return null
    return modules.find((item) => item.Id_Module === selectedStandard.Id_Module) ?? null
  }, [modules, selectedStandard?.Id_Module])

  const selectedMedium = useMemo(
    () => media.find((item) => String(item.Id_Milieu) === selectedMediumId) ?? null,
    [media, selectedMediumId],
  )

  useEffect(() => {
    if (!selectedStandard) return
    setIsExternalStandard(Boolean(selectedStandard.Est_Sonde_Externe))
  }, [selectedStandard])

  const allSensorIds = useMemo(() => sensors.map((sensor) => sensor.id), [sensors])
  const allSelected = allSensorIds.length > 0 && allSensorIds.every((id) => selectedSensorIds.includes(id))
  const someSelected = allSensorIds.some((id) => selectedSensorIds.includes(id))

  const selectedSensors = useMemo(
    () => sensors.filter((sensor) => selectedSensorIds.includes(sensor.id)),
    [selectedSensorIds, sensors],
  )

  const sensorsColumns = useMemo<ColumnDef<(typeof sensors)[number]>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <div className="flex justify-center">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => {
                setSelectedSensorIds(checked === true ? allSensorIds : [])
              }}
              aria-label={t("selection.table.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => {
          const id = row.original.id
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={selectedSensorIds.includes(id)}
                onCheckedChange={(checked) => {
                  setSelectedSensorIds((current) =>
                    checked === true ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id),
                  )
                }}
                aria-label={t("selection.table.selectOne", { serial: row.original.serialNumber })}
              />
            </div>
          )
        },
      },
      {
        accessorKey: "serialNumber",
        header: t("selection.table.columns.serial"),
      },
      {
        accessorKey: "locationName",
        header: t("selection.table.columns.location"),
        cell: ({ row }) => row.original.locationName ?? t("selection.table.unassigned"),
      },
    ],
    [allSelected, allSensorIds, selectedSensorIds, someSelected, t],
  )

  const standardDisabled = isExternalStandard

  const formattedDateTime = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(currentDateTime)

  const sliderVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 72 : -72 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -72 : 72 }),
  }

  return (
    <>
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="space-y-6 p-6">
        {selectedSensorIds.length > 0 ? (
          <Alert className="border-primary/30 bg-primary/5">
            <ArrowRight className="h-4 w-4 text-primary" />
            <AlertTitle>{t("selection.banner.title", { count: selectedSensorIds.length })}</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{t("selection.banner.description")}</span>
              {step === "selection" ? (
                <Button
                  type="button"
                  onClick={() => {
                    setDirection(1)
                    setStep("adjustment")
                  }}
                >
                  {t("selection.banner.cta")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDirection(-1)
                    setStep("selection")
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("adjustment.backToSelection")}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-hidden">
          <LazyMotion features={domAnimation}>
            <AnimatePresence custom={direction} mode="wait">
              {step === "selection" ? (
                <m.div
                  key="selection"
                  custom={direction}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("selection.title")}</CardTitle>
                      <CardDescription>{t("selection.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TanStackTable
                        columns={sensorsColumns}
                        data={sensors}
                        searchField={["serialNumber", "locationName"]}
                        searchPlaceholder={t("selection.table.searchPlaceholder")}
                        isLoading={isSensorsLoading}
                        emptyMessage={t("selection.table.empty")}
                        maxHeight="60vh"
                        headerClassName="!bg-sidebar !text-sidebar-foreground"
                        headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                        tableClassName="border-separate border-spacing-0 [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0"
                        exportFileName={t("selection.table.exportFileName")}
                      />
                    </CardContent>
                  </Card>
                </m.div>
              ) : (
                <m.div
                  key="adjustment"
                  custom={direction}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="grid gap-4 xl:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <GaugeCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.general.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.general.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-current-datetime">{t("adjustment.cards.general.currentDateTime")}</Label>
                          <Input id="adjustment-current-datetime" value={formattedDateTime} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-operator">{t("adjustment.cards.general.operator")}</Label>
                          <Input
                            id="adjustment-operator"
                            value={operator}
                            onChange={(event) => setOperator(event.target.value)}
                            placeholder={t("adjustment.cards.general.operatorPlaceholder")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjustment-display-decimals">{t("adjustment.cards.general.displayDecimals")}</Label>
                          <Input
                            id="adjustment-display-decimals"
                            type="number"
                            min={0}
                            max={6}
                            value={displayDecimals}
                            onChange={(event) => setDisplayDecimals(event.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <FlaskConical className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.standard.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.standard.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                          <BadgeInfo className="h-4 w-4 text-amber-700" />
                          <AlertTitle>{t("adjustment.cards.standard.coefficientsAlertTitle")}</AlertTitle>
                          <AlertDescription>{t("adjustment.cards.standard.coefficientsAlertDescription")}</AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="adjustment-external-standard"
                              checked={isExternalStandard}
                              onCheckedChange={(checked) => setIsExternalStandard(checked === true)}
                            />
                            <Label htmlFor="adjustment-external-standard">
                              {t("adjustment.cards.standard.externalProbe")}
                            </Label>
                          </div>
                          {isExternalStandard ? (
                            <p className="text-sm text-amber-700">
                              {t("adjustment.cards.standard.externalProbeHint")}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.standard.standardProbe")}</Label>
                          <Combobox
                            triggerId="adjustment-standard-probe"
                            value={selectedStandardId}
                            onValueChange={setSelectedStandardId}
                            disabled={standardDisabled || isStandardsLoading}
                            placeholder={t("adjustment.cards.standard.standardProbePlaceholder")}
                            searchPlaceholder={t("adjustment.cards.standard.standardProbeSearchPlaceholder")}
                            emptyMessage={t("adjustment.cards.standard.standardProbeEmpty")}
                            options={standards.map((item) => ({
                              value: String(item.Id_Etalon),
                              label: item.Etalon_Numero_Serie ?? `#${item.Id_Etalon}`,
                              searchText: [
                                item.Etalon_Numero_Serie,
                                item.Organisme,
                                item.Num_Certif,
                                item.Unite,
                              ]
                                .filter(Boolean)
                                .join(" "),
                            }))}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.organization")}</Label>
                            <Input value={selectedStandard?.Organisme ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.certificateDate")}</Label>
                            <Input value={selectedStandard?.Date_Certif ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.certificateNumber")}</Label>
                            <Input value={selectedStandard?.Num_Certif ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.unit")}</Label>
                            <Input value={selectedStandard?.Unite ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.resolution")}</Label>
                            <Input value={selectedStandard?.Resolution ?? ""} readOnly disabled={standardDisabled} />
                          </div>
                          <div className="space-y-2">
                            <Label>{t("adjustment.cards.standard.standardDecimals")}</Label>
                            <Input
                              value={selectedStandard?.Nb_Decimale != null ? String(selectedStandard.Nb_Decimale) : ""}
                              readOnly
                              disabled={standardDisabled}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-3 text-primary">
                            <Waves className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{t("adjustment.cards.module.title")}</CardTitle>
                            <CardDescription>{t("adjustment.cards.module.description")}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.module.module")}</Label>
                          <Input
                            value={selectedModule?.Module_Numero_Serie ?? ""}
                            readOnly
                            disabled={standardDisabled || !selectedStandard}
                            placeholder={t("adjustment.cards.module.empty")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.module.serialPort")}</Label>
                          <Input
                            value={selectedModule?.Port_Serie ?? selectedStandard?.Port_Serie ?? ""}
                            readOnly
                            disabled={standardDisabled || !selectedStandard}
                            placeholder={t("adjustment.cards.module.empty")}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.cards.medium.title")}</CardTitle>
                      <CardDescription>{t("adjustment.cards.medium.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 md:max-w-md">
                        <Label>{t("adjustment.cards.medium.select")}</Label>
                        <Select
                          value={selectedMediumId}
                          onValueChange={setSelectedMediumId}
                          disabled={isExternalStandard || isMediaLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("adjustment.cards.medium.selectPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {media.length === 0 ? (
                              <SelectEmpty>{t("adjustment.cards.medium.empty")}</SelectEmpty>
                            ) : (
                              media.map((item) => (
                                <SelectItem key={item.Id_Milieu} value={String(item.Id_Milieu)}>
                                  {`${item.Model ?? "-"} / ${item.Reference ?? "-"}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.model")}</Label>
                          <Input value={selectedMedium?.Model ?? ""} readOnly disabled={isExternalStandard} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.reference")}</Label>
                          <Input value={selectedMedium?.Reference ?? ""} readOnly disabled={isExternalStandard} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.stability")}</Label>
                          <Input
                            value={selectedMedium?.Stabilite != null ? String(selectedMedium.Stabilite) : ""}
                            readOnly
                            disabled={isExternalStandard}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adjustment.cards.medium.homogeneity")}</Label>
                          <Input
                            value={selectedMedium?.Homogeneite != null ? String(selectedMedium.Homogeneite) : ""}
                            readOnly
                            disabled={isExternalStandard}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.cards.plateau.title")}</CardTitle>
                      <CardDescription>{t("adjustment.cards.plateau.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="adjustment-plateau-duration">
                          {t("adjustment.cards.plateau.durationMinutes")}
                        </Label>
                        <Input
                          id="adjustment-plateau-duration"
                          type="number"
                          min={1}
                          step="1"
                          value={stabilityPlateauDuration}
                          onChange={(event) => setStabilityPlateauDuration(event.target.value)}
                          disabled={isExternalStandard}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adjustment-plateau-max-gap">
                          {t("adjustment.cards.plateau.maxGap")}
                        </Label>
                        <Input
                          id="adjustment-plateau-max-gap"
                          type="number"
                          min={0}
                          step="0.01"
                          value={stabilityPlateauMaxGap}
                          onChange={(event) => setStabilityPlateauMaxGap(event.target.value)}
                          disabled={isExternalStandard}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("adjustment.selectionSummary.title")}</CardTitle>
                      <CardDescription>{t("adjustment.selectionSummary.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {selectedSensors.map((sensor) => (
                        <Badge key={sensor.id} variant="outline">
                          {sensor.serialNumber}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>

        <MetrologySubpagesCards current="adjustment" />
      </div>
    </>
  )
}
