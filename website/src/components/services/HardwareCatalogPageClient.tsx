"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowRight, FileDown, Mail, Package2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLicense } from "@/components/license/license-provider"
import { ServicesNavbar } from "@/components/services/ServicesNavbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DotPattern } from "@/components/ui/dot-pattern"
import { BlurFade } from "@/components/ui/blur-fade"
import { getJson, HttpError, postJson } from "@/lib/http"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { HardwareCatalogToc } from "./hardware-order/hardware-catalog-toc"
import { HardwareMaterialCard } from "./hardware-order/hardware-material-card"
import { HardwareOrderResultDialog } from "./hardware-order/hardware-order-result-dialog"
import { HardwareOrderSummary } from "./hardware-order/hardware-order-summary"
import { BackToTop } from "@/components/upgrade/BackToTop"

type HardwareMaterial = {
  Id_Materiel: number
  Ref_Commercial: string
  Designation: string
  Descriptif: string
  Gamme: string
  Type: string
  Chemin_Image: string | null
}

type HardwareCatalogResponse = {
  catalog: HardwareMaterial[]
  commercialEmail: string
  smtpReady: boolean
}

type HardwareOrderResponse = {
  orderId: number
  reference: string
  modeTransmission: "SMTP" | "MAILTO"
  emailStatus: "SENT" | "FAILED" | "PREPARED"
  emailError: string | null
  commercialEmail: string
  mailtoUrl: string | null
  pdfDownloadUrl: string
}

type OrderResultState =
  | {
      kind: "success"
      reference: string
      pdfDownloadUrl: string
      countdown: number
      downloadStarted: boolean
      mailtoUrl: null
    }
  | {
      kind: "prepared"
      reference: string
      pdfDownloadUrl: string
      countdown: number
      downloadStarted: boolean
      mailtoUrl: string | null
    }
  | {
      kind: "failure"
      reference: string
      pdfDownloadUrl: string
      message: string
    }
  | null

type HardwareTocItem = {
  id: string
  label: ReactNode
  children?: HardwareTocItem[]
}

const GAMME_LABELS: Record<string, string> = {
  GSP: "GemSense Pro",
  GSO: "GemSense One",
}

const TYPE_LABELS: Record<string, string> = {
  RADIO: "Radio",
  ETHERNET: "Ethernet",
  ETALON: "Etalon",
  FILAIRE: "Filaire",
}

const TYPE_ORDER: Record<string, number> = {
  RADIO: 1,
  ETALON: 2,
  ETHERNET: 3,
  FILAIRE: 4,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildPdfPayload(
  cart: Record<number, number>,
  comment: string,
  customerId: string | null,
) {
  return {
    items: Object.entries(cart).map(([materialId, quantity]) => ({
      materialId: Number(materialId),
      quantity,
    })),
    comment: comment.trim() || null,
    customerId: customerId?.trim() || null,
  }
}

function renderGammeLabel(label: string, navMode = false) {
  const [prefix, suffix] = label.split(" ")
  if (!suffix) return <span>{label}</span>

  if (navMode) {
    return (
      <span className="transition-colors">
        <span className="text-slate-500 transition-colors group-hover:text-[hsl(var(--sidebar))] dark:text-slate-300 dark:group-hover:text-white">
          {prefix}
        </span>{" "}
        <span className="text-slate-500 transition-colors group-hover:text-primary dark:text-slate-300 dark:group-hover:text-primary">
          {suffix}
        </span>
      </span>
    )
  }

  return (
    <span>
      <span className="text-[hsl(var(--sidebar))] dark:text-white">{prefix}</span>{" "}
      <span className="text-primary">{suffix}</span>
    </span>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function downloadPdfFromRoute(url: string, fallbackFileName: string) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    let message = "Erreur lors du telechargement du PDF"
    try {
      const payload = await response.json()
      if (payload?.message) message = String(payload.message)
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const disposition = response.headers.get("Content-Disposition") || ""
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/)
  const fileName = fileNameMatch?.[1] || fallbackFileName
  const blob = await response.blob()
  downloadBlob(blob, fileName)
}

export function HardwareCatalogPageClient() {
  const t = useTranslations()
  const { license } = useLicense()
  const [cart, setCart] = useState<Record<number, number>>({})
  const [comment, setComment] = useState("")
  const [orderResult, setOrderResult] = useState<OrderResultState>(null)

  const customerId = license?.ok ? license.customerId ?? null : null

  const navItems = [
    { name: renderGammeLabel("GemSense One", true), link: "#gamme-gso" },
    { name: renderGammeLabel("GemSense Pro", true), link: "#gamme-gsp" },
    {
      name: <span className="text-[hsl(var(--sidebar))] dark:text-white">{t("servicesHardware.nav.modules")}</span>,
      link: "#catalog-modules",
    },
    {
      name: <span className="text-[hsl(var(--sidebar))] dark:text-white">{t("servicesHardware.nav.sensors")}</span>,
      link: "#catalog-sondes",
    },
  ]

  const catalogQuery = useQuery({
    queryKey: ["services", "hardware", "catalog"],
    queryFn: () => getJson<HardwareCatalogResponse>("/api/services/hardware/catalog"),
  })

  const materials = useMemo(() => catalogQuery.data?.catalog ?? [], [catalogQuery.data?.catalog])
  const commercialEmail = catalogQuery.data?.commercialEmail ?? "contactsite@mc2lab.fr"
  const smtpReady = catalogQuery.data?.smtpReady ?? false

  const groupedCatalog = useMemo(() => {
    const result = new Map<string, { modules: HardwareMaterial[]; byType: Map<string, HardwareMaterial[]> }>()
    for (const material of materials) {
      const gamme = material.Gamme || "AUTRES"
      const type = material.Type || "AUTRES"
      if (!result.has(gamme)) result.set(gamme, { modules: [], byType: new Map() })
      const gammeGroup = result.get(gamme)!
      const isModule = material.Ref_Commercial.startsWith("M-")
      if (isModule) {
        gammeGroup.modules.push(material)
      } else {
        if (!gammeGroup.byType.has(type)) gammeGroup.byType.set(type, [])
        gammeGroup.byType.get(type)!.push(material)
      }
    }
    return Array.from(result.entries()).map(([gamme, typeMap]) => ({
      gamme,
      sectionId: `gamme-${slugify(gamme)}`,
      modules: typeMap.modules.sort((a, b) => a.Designation.localeCompare(b.Designation, "fr")),
      items: Array.from(typeMap.byType.entries())
        .sort((a, b) => (TYPE_ORDER[a[0]] ?? 99) - (TYPE_ORDER[b[0]] ?? 99))
        .map(([type, entries]) => ({
          type,
          sectionId: `gamme-${slugify(gamme)}-${slugify(type)}`,
          entries: entries.sort((a, b) => a.Designation.localeCompare(b.Designation, "fr")),
        })),
    }))
  }, [materials])

  const tocItems = useMemo<HardwareTocItem[]>(() => {
    return groupedCatalog.map((gammeGroup) => {
      const gammeLabel = GAMME_LABELS[gammeGroup.gamme] ?? gammeGroup.gamme

      if (gammeGroup.gamme === "GSO") {
        return {
          id: gammeGroup.sectionId,
          label: renderGammeLabel(gammeLabel),
          children: [
            ...gammeGroup.modules.map((module) => ({
              id: `materiel-${module.Id_Materiel}`,
              label: module.Ref_Commercial || module.Designation,
            })),
            ...(gammeGroup.items.length > 0
              ? [
                  {
                    id: gammeGroup.items[0].sectionId,
                    label: t("servicesHardware.nav.sensors"),
                  },
                ]
              : []),
          ],
        }
      }

      return {
        id: gammeGroup.sectionId,
        label: renderGammeLabel(gammeLabel),
        children: gammeGroup.items.map((typeGroup) => {
          const typeModules = gammeGroup.modules.filter((module) => module.Type === typeGroup.type)
          return {
            id: typeGroup.sectionId,
            label: TYPE_LABELS[typeGroup.type] ?? typeGroup.type,
            children: [
              ...typeModules.map((module) => ({
                id: `materiel-${module.Id_Materiel}`,
                label: module.Ref_Commercial || module.Designation,
              })),
              {
                id: typeGroup.sectionId,
                label: t("servicesHardware.nav.sensors"),
              },
            ],
          }
        }),
      }
    })
  }, [groupedCatalog, t])

  const summaryItems = useMemo(
    () =>
      materials
        .filter((material) => (cart[material.Id_Materiel] ?? 0) > 0)
        .map((material) => ({
          materialId: material.Id_Materiel,
          refCommercial: material.Ref_Commercial,
          designation: material.Designation,
          gamme: GAMME_LABELS[material.Gamme] ?? material.Gamme,
          rawGamme: material.Gamme,
          rawType: material.Type,
          typeLabel: TYPE_LABELS[material.Type] ?? material.Type,
          isModule: material.Ref_Commercial.startsWith("M-"),
          family: material.Ref_Commercial.startsWith("M-")
            ? t("servicesHardware.nav.modules")
            : TYPE_LABELS[material.Type] ?? material.Type,
          kind: material.Ref_Commercial.startsWith("M-")
            ? t("servicesHardware.summary.kindModule")
            : t("servicesHardware.summary.kindSensor"),
          quantity: cart[material.Id_Materiel],
        })),
    [cart, materials, t],
  )

  const totalQuantity = summaryItems.reduce((sum, item) => sum + item.quantity, 0)

  const setMaterialQuantity = (materialId: number, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) {
        const next = { ...current }
        delete next[materialId]
        return next
      }

      return {
        ...current,
        [materialId]: Math.min(999, quantity),
      }
    })
  }

  const handleOrderPdfDownload = async (pdfDownloadUrl: string, reference: string) => {
    await downloadPdfFromRoute(pdfDownloadUrl, `demande-devis-${reference}.pdf`)
  }

  useEffect(() => {
    if (!orderResult) return
    if (orderResult.kind !== "success" && orderResult.kind !== "prepared") return
    if (orderResult.downloadStarted) return

    if (orderResult.countdown <= 0) {
      handleOrderPdfDownload(orderResult.pdfDownloadUrl, orderResult.reference)
        .then(() => {
          setOrderResult((current) =>
            current && (current.kind === "success" || current.kind === "prepared")
              ? { ...current, downloadStarted: true }
              : current,
          )
          if (orderResult.kind === "prepared" && orderResult.mailtoUrl) {
            window.location.href = orderResult.mailtoUrl
          }
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: t("servicesHardware.feedback.pdfErrorTitle"),
            description:
              error instanceof Error ? error.message : t("servicesHardware.feedback.pdfError"),
          })
          setOrderResult((current) =>
            current && (current.kind === "success" || current.kind === "prepared")
              ? { ...current, downloadStarted: true }
              : current,
          )
        })
      return
    }

    const timer = window.setTimeout(() => {
      setOrderResult((current) =>
        current && (current.kind === "success" || current.kind === "prepared")
          ? { ...current, countdown: current.countdown - 1 }
          : current,
      )
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [orderResult, t])

  const pdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/services/hardware/pdf", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPdfPayload(cart, comment, customerId)),
      })

      if (!response.ok) {
        let message = t("servicesHardware.feedback.pdfError")
        try {
          const payload = await response.json()
          if (payload?.message) message = String(payload.message)
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const blob = await response.blob()
      downloadBlob(blob, "DM-sans-client.pdf")
    },
    onSuccess: () => {
      toast({
        title: t("servicesHardware.feedback.pdfReadyTitle"),
        description: t("servicesHardware.feedback.pdfReadyDescription"),
      })
    },
    onError: (error: unknown) => {
      toast({
        variant: "destructive",
        title: t("servicesHardware.feedback.pdfErrorTitle"),
        description:
          error instanceof Error ? error.message : t("servicesHardware.feedback.pdfError"),
      })
    },
  })

  const orderMutation = useMutation({
    mutationFn: () =>
      postJson<HardwareOrderResponse>(
        "/api/services/hardware/orders",
        buildPdfPayload(cart, comment, customerId),
      ),
    onSuccess: async (data) => {
      setCart({})
      setComment("")

      if (data.modeTransmission === "SMTP") {
        if (data.emailStatus === "SENT") {
          setOrderResult({
            kind: "success",
            reference: data.reference,
            pdfDownloadUrl: data.pdfDownloadUrl,
            countdown: 3,
            downloadStarted: false,
            mailtoUrl: null,
          })
          return
        }

        setOrderResult({
          kind: "failure",
          reference: data.reference,
          pdfDownloadUrl: data.pdfDownloadUrl,
          message:
            data.emailError ||
            t("servicesHardware.feedback.dialog.failureFallback"),
        })
        return
      }

      setOrderResult({
        kind: "prepared",
        reference: data.reference,
        pdfDownloadUrl: data.pdfDownloadUrl,
        countdown: 3,
        downloadStarted: false,
        mailtoUrl: data.mailtoUrl,
      })
    },
    onError: (error: unknown) => {
      const message =
        error instanceof HttpError
          ? (error.payload?.message as string | undefined) || error.message
          : error instanceof Error
            ? error.message
            : t("servicesHardware.feedback.orderError")

      toast({
        variant: "destructive",
        title: t("servicesHardware.feedback.orderErrorTitle"),
        description: message,
      })
    },
  })

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(15,23,42,0.96))]">
      <ServicesNavbar items={navItems} />
      <DotPattern className="fixed inset-0 h-screen w-screen opacity-30 dark:text-slate-700/70 dark:opacity-45" />
      <HardwareCatalogToc items={tocItems} title={t("servicesHardware.nav.title")} />
      <BackToTop />

      <main className="relative z-10 px-4 pb-24 pt-24">
        <div className="mx-auto max-w-7xl">
          <BlurFade>
            <section className="overflow-hidden rounded-4xl border border-primary/15 bg-[linear-gradient(135deg,rgba(25,145,201,0.96),rgba(11,27,52,0.98))] px-8 py-10 text-white shadow-[0_35px_90px_-50px_rgba(15,23,42,0.65)] dark:border-primary/25 dark:shadow-[0_35px_110px_-50px_rgba(8,47,73,0.75)]">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                    {t("servicesHardware.hero.eyebrow")}
                  </p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                    {t("servicesHardware.hero.title")}
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
                    {t("servicesHardware.hero.subtitle")}
                  </p>

                </div>

                <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/20">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                    {t("servicesHardware.contact.title")}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-lg font-semibold">
                    <Mail className="h-5 w-5" />
                    {commercialEmail}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">
                    {smtpReady
                      ? t("servicesHardware.contact.smtpDescription")
                      : t("servicesHardware.contact.mailtoDescription")}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-white/75">
                    <ArrowRight className="h-4 w-4" />
                    {t("servicesHardware.contact.footer")}
                  </div>
                </div>
              </div>
            </section>
          </BlurFade>

          <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-10">
              {catalogQuery.isLoading ? (
                <div className="rounded-3xl border border-border/60 bg-card/80 p-10 text-center text-muted-foreground dark:border-slate-800 dark:bg-slate-900/75">
                  {t("servicesHardware.states.loading")}
                </div>
              ) : catalogQuery.isError ? (
                <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center text-destructive dark:bg-destructive/10">
                  {t("servicesHardware.states.error")}
                </div>
              ) : (
                groupedCatalog.map((gammeGroup) => (
                  <section
                    key={gammeGroup.gamme}
                    id={gammeGroup.sectionId}
                    className="scroll-mt-28 space-y-5"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-primary">
                          {t("servicesHardware.sections.gamme")}
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-foreground">
                          {renderGammeLabel(GAMME_LABELS[gammeGroup.gamme] ?? gammeGroup.gamme)}
                        </h2>
                      </div>
                      <Badge variant="secondary" className="px-4 py-2 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100">
                        {t("servicesHardware.sections.references", {
                          count:
                            gammeGroup.modules.length +
                            gammeGroup.items.reduce(
                              (count, typeGroup) => count + typeGroup.entries.length,
                              0,
                            ),
                        })}
                      </Badge>
                    </div>

                    <div className="space-y-8">
                      {gammeGroup.gamme === "GSO" && gammeGroup.modules.length > 0 ? (
                        <div id={`${gammeGroup.sectionId}-modules`} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="h-px flex-1 bg-border/70" />
                            <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
                              {t("servicesHardware.nav.modules")}
                            </p>
                            <span className="h-px flex-1 bg-border/70" />
                          </div>

                          <div className="grid gap-5">
                            {gammeGroup.modules.map((material) => (
                              <HardwareMaterialCard
                                key={material.Id_Materiel}
                                material={material}
                                quantity={cart[material.Id_Materiel] ?? 0}
                                anchorId={`materiel-${material.Id_Materiel}`}
                                gammeLabel={GAMME_LABELS[material.Gamme] ?? material.Gamme}
                                typeLabel={t("servicesHardware.nav.modules")}
                                addLabel={t("servicesHardware.actions.add")}
                                quantityLabel={t("servicesHardware.summary.quantity")}
                                onQuantityChange={(quantity) =>
                                  setMaterialQuantity(material.Id_Materiel, quantity)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {gammeGroup.items.map((typeGroup) => (
                        <div
                          key={`${gammeGroup.gamme}-${typeGroup.type}`}
                          id={typeGroup.sectionId}
                          className="scroll-mt-28 space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-px flex-1 bg-border/70" />
                            <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
                              {TYPE_LABELS[typeGroup.type] ?? typeGroup.type}
                            </p>
                            <span className="h-px flex-1 bg-border/70" />
                          </div>

                          {(() => {
                            const typeModules =
                              gammeGroup.gamme === "GSP"
                                ? gammeGroup.modules.filter((module) => module.Type === typeGroup.type)
                                : []

                            return typeModules.length > 0 ? (
                              <div className="grid gap-5">
                                {typeModules.map((material) => (
                                  <HardwareMaterialCard
                                    key={material.Id_Materiel}
                                    material={material}
                                    quantity={cart[material.Id_Materiel] ?? 0}
                                    anchorId={`materiel-${material.Id_Materiel}`}
                                    gammeLabel={renderGammeLabel(
                                      GAMME_LABELS[material.Gamme] ?? material.Gamme,
                                    )}
                                    typeLabel={t("servicesHardware.nav.modules")}
                                    addLabel={t("servicesHardware.actions.add")}
                                    quantityLabel={t("servicesHardware.summary.quantity")}
                                    onQuantityChange={(quantity) =>
                                      setMaterialQuantity(material.Id_Materiel, quantity)
                                    }
                                  />
                                ))}
                              </div>
                            ) : null
                          })()}

                          <div className="grid gap-5">
                            {typeGroup.entries.map((material) => (
                              <HardwareMaterialCard
                                key={material.Id_Materiel}
                                material={material}
                                quantity={cart[material.Id_Materiel] ?? 0}
                                anchorId={`materiel-${material.Id_Materiel}`}
                                gammeLabel={renderGammeLabel(
                                  GAMME_LABELS[material.Gamme] ?? material.Gamme,
                                )}
                                typeLabel={TYPE_LABELS[material.Type] ?? material.Type}
                                addLabel={t("servicesHardware.actions.add")}
                                quantityLabel={t("servicesHardware.summary.quantity")}
                                onQuantityChange={(quantity) =>
                                  setMaterialQuantity(material.Id_Materiel, quantity)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>

            <HardwareOrderSummary
              className="xl:sticky xl:top-28 xl:self-start"
              items={summaryItems}
              comment={comment}
              totalQuantity={totalQuantity}
              commercialEmail={commercialEmail}
              customerId={customerId}
              smtpReady={smtpReady}
              onCommentChange={setComment}
              onQuantityChange={setMaterialQuantity}
              onRemove={(materialId) => setMaterialQuantity(materialId, 0)}
              onSavePdf={() => pdfMutation.mutate()}
              onSubmit={() => orderMutation.mutate()}
              busy={pdfMutation.isPending || orderMutation.isPending}
              labels={{
                title: t("servicesHardware.summary.title"),
                empty: t("servicesHardware.summary.empty"),
                quantity: t("servicesHardware.summary.quantity"),
                comment: t("servicesHardware.summary.comment"),
                commentPlaceholder: t("servicesHardware.summary.commentPlaceholder"),
                totalItems: t("servicesHardware.summary.totalItems"),
                customerNumber: t("servicesHardware.summary.customerNumber"),
                customerNumberEmpty: t("servicesHardware.summary.customerNumberEmpty"),
                totalReferences: t("servicesHardware.summary.totalReferences"),
                modules: t("servicesHardware.nav.modules"),
                sensors: t("servicesHardware.nav.sensors"),
                emailDelivery: t("servicesHardware.summary.emailDelivery"),
                mailtoDelivery: t("servicesHardware.summary.mailtoDelivery"),
                savePdf: t("servicesHardware.actions.savePdf"),
                submit: smtpReady
                  ? t("servicesHardware.actions.submitQuote")
                  : t("servicesHardware.actions.prepareQuoteEmail"),
                remove: t("servicesHardware.actions.remove"),
              }}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-border/60 bg-card/70 px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_18px_70px_-50px_rgba(15,23,42,0.85)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{t("servicesHardware.footer.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("servicesHardware.footer.subtitle")}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => pdfMutation.mutate()}
                  disabled={pdfMutation.isPending || summaryItems.length === 0}
                >
                  <FileDown className="h-4 w-4" />
                  {t("servicesHardware.actions.savePdf")}
                </Button>
                <Button
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isPending || summaryItems.length === 0}
                >
                  {smtpReady
                    ? t("servicesHardware.actions.submitQuote")
                    : t("servicesHardware.actions.prepareQuoteEmail")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HardwareOrderResultDialog
        open={orderResult !== null}
        kind={orderResult?.kind ?? null}
        reference={orderResult?.reference ?? null}
        description={
          orderResult?.kind === "success"
            ? t("servicesHardware.feedback.orderSentDescription", {
                reference: orderResult.reference,
              })
            : orderResult?.kind === "prepared"
              ? t("servicesHardware.feedback.dialog.preparedDescription", {
                  reference: orderResult.reference,
                })
            : orderResult?.kind === "failure"
              ? t("servicesHardware.feedback.dialog.failureDescription", {
                  reference: orderResult.reference,
                  details: orderResult.message,
                })
              : ""
        }
        countdown={
          orderResult?.kind === "success" || orderResult?.kind === "prepared"
            ? orderResult.countdown
            : null
        }
        downloadReady={
          orderResult?.kind === "failure" ||
          ((orderResult?.kind === "success" || orderResult?.kind === "prepared") &&
            orderResult.downloadStarted)
        }
        labels={{
          successTitle: t("servicesHardware.feedback.dialog.successTitle"),
          failureTitle: t("servicesHardware.feedback.dialog.failureTitle"),
          preparedTitle: t("servicesHardware.feedback.dialog.preparedTitle"),
          countdown: (seconds) =>
            t("servicesHardware.feedback.dialog.countdown", { seconds }),
          downloadHint: t("servicesHardware.feedback.dialog.downloadHint"),
          downloadNow: t("servicesHardware.feedback.dialog.downloadNow"),
          close: t("servicesHardware.feedback.dialog.close"),
          cancel: t("servicesHardware.feedback.dialog.cancel"),
        }}
        onOpenChange={(open) => {
          if (!open) setOrderResult(null)
        }}
        onDownload={() => {
          if (!orderResult) return
          void handleOrderPdfDownload(orderResult.pdfDownloadUrl, orderResult.reference).catch(
            (error) => {
              toast({
                variant: "destructive",
                title: t("servicesHardware.feedback.pdfErrorTitle"),
                description:
                  error instanceof Error ? error.message : t("servicesHardware.feedback.pdfError"),
              })
            },
          )

          if (orderResult.kind === "success" || orderResult.kind === "prepared") {
            setOrderResult((current) =>
              current && (current.kind === "success" || current.kind === "prepared")
                ? { ...current, downloadStarted: true }
                : current,
            )
            if (orderResult.kind === "prepared" && orderResult.mailtoUrl) {
              window.location.href = orderResult.mailtoUrl
            }
          }
        }}
      />
    </div>
  )
}
