"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileCog,
  Flag,
  Loader2,
  PackageCheck,
  ShieldAlert,
  Truck,
} from "lucide-react"

import { useAppAccess } from "@/components/access/app-access-provider"
import { VigilogConfigurationDialog } from "@/components/services/vigilog/vigilog-configuration-dialog"
import { VigilogLoggerDialog } from "@/components/services/vigilog/vigilog-logger-dialog"
import { VigilogTourneeDetailDialog } from "@/components/services/vigilog/vigilog-tournee-detail-dialog"
import type {
  VigilogConfiguration,
  VigilogLogger,
  VigilogTemporaryUsage,
  VigilogTemporaryUsagesResponse,
  VigilogTourneeDetail,
  VigilogTournee,
  VigilogTourneesResponse,
} from "@/components/services/vigilog/types"
import { TanStackTable } from "@/components/data-table/tanstack-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSitesSimple } from "@/hooks/useSites"
import { useToast } from "@/hooks/use-toast"
import { getJson, patchJson, postJson } from "@/lib/http"
import { formatDbDateTime } from "@/lib/date-display"
import { formatNumber as formatDisplayNumber } from "@/lib/number-display"
import type { VigilogAgentConfigureResponse } from "@/lib/vigilog-agent"
import {
  clearVigilogAgent,
  configureVigilogAgent,
  presenceVigilogAgent,
  probeVigilogAgent,
  readVigilogAgent,
} from "@/lib/vigilog-agent"

const CONFIG_QUERY_KEY = ["services", "vigilog", "configurations"] as const
const LOGGERS_QUERY_KEY = ["services", "vigilog", "loggers"] as const
const TOURNEES_QUERY_KEY = ["services", "vigilog", "tournees"] as const
const TEMP_USAGES_QUERY_KEY = ["services", "vigilog", "usages-ponctuels"] as const
const AGENT_PRESENCE_QUERY_KEY = ["services", "vigilog", "agent", "presence"] as const
const AUTO_PROBE_INTERVAL_MS = 4000

function normalizePresenceDetails(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function formatDateTime(value: string | null, locale: string) {
  return formatDbDateTime(value, {
    format: "dateTime",
    locale: locale === "fr" ? "fr-FR" : "en-GB",
  })
}

function formatDate(value: string | null, locale: string) {
  return formatDbDateTime(value, {
    format: "date",
    locale: locale === "fr" ? "fr-FR" : "en-GB",
  })
}

function formatNumber(value: number | null) {
  return formatDisplayNumber(value, { decimals: 2, locale: "en-US", grouping: false, fallback: "-" })
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds || totalSeconds <= 0) return "-"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "EN_ATTENTE_RECEPTION":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "RECUE":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "ANALYSEE":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case "ACQUITTEE":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "ANNULEE":
      return "bg-zinc-200 text-zinc-700 border-zinc-300"
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200"
  }
}

function trafficLightClass(result: VigilogTournee["trafficLight"]) {
  switch (result) {
    case "VERT":
      return "bg-emerald-500"
    case "ORANGE":
      return "bg-amber-500"
    case "ROUGE":
      return "bg-rose-500"
    default:
      return "bg-zinc-300"
  }
}

function loggerStatusClasses(status: "ready" | "base-only" | "missing" | "error" | "loading") {
  switch (status) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-900"
    case "base-only":
      return "border-amber-200 bg-amber-50 text-amber-900"
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-900"
    case "loading":
      return "border-sky-200 bg-sky-50 text-sky-900"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-800"
  }
}

const vigilogActionButtonSecondaryShadowClass =
  "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200 shadow-[0_3px_10px_rgba(217,119,6,0.1)]"
const vigilogComboboxButtonClass =
  "border-sky-200 bg-sky-50/80 text-sky-950 hover:bg-sky-100/90"
const vigilogComboboxPopoverClass =
  "border-border/60 bg-white/95 dark:bg-white/95 dark:bg-card/95"
const vigilogBlueActionButtonClass =
  "border-sky-200 bg-sky-50/80 text-sky-950 hover:bg-sky-100/90 shadow-[0_3px_10px_rgba(14,165,233,0.12)]"
const vigilogBluePrimaryButtonClass =
  "border-sky-200 bg-sky-100/70 text-sky-950 hover:bg-sky-100 shadow-[0_8px_24px_rgba(14,165,233,0.14)]"
const vigilogAmberButtonClass =
  "border-amber-200 bg-amber-100/70 text-amber-950 hover:bg-amber-100 shadow-[0_8px_24px_rgba(245,158,11,0.12)]"

type DepartureDialogState =
  | { mode: "closed" }
  | {
      mode: "running" | "success" | "error"
      currentStep: number
      reference?: string
      error?: string
    }

type ReceiveDialogState =
  | { mode: "closed" }
  | {
      mode: "running" | "error"
      currentStep: number
      error?: string
    }

export function VigilogPageClient() {
  const t = useTranslations("servicesVigilog")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { hasAuthorizationCode, isExpert, isStandard, loading: accessLoading } = useAppAccess()

  const hasVigilogLicense = isStandard || isExpert
  const canAccess = hasVigilogLicense && hasAuthorizationCode("ACCES_VIGILOG")
  const canManageConfigurations = hasAuthorizationCode(
    "PARAMETRAGE_MATERIEL",
    "ACCES_PARAMETRAGE_MATERIEL",
    "MATERIEL_MESURE_GERER",
    "MATERIEL_METROLOGIE_GERER",
  )

  const [activeTab, setActiveTab] = useState("movements")
  const [configurationDialogOpen, setConfigurationDialogOpen] = useState(false)
  const [editingConfiguration, setEditingConfiguration] = useState<VigilogConfiguration | null>(null)
  const [loggerDialogOpen, setLoggerDialogOpen] = useState(false)
  const [editingLogger, setEditingLogger] = useState<VigilogLogger | null>(null)
  const [loggerDialogDefaults, setLoggerDialogDefaults] = useState<{
    serial?: string
    model?: string
    label?: string
  } | null>(null)

  const [selectedConfigurationId, setSelectedConfigurationId] = useState("")
  const [departureSiteId, setDepartureSiteId] = useState("")
  const [arrivalSiteId, setArrivalSiteId] = useState("")
  const [loggerSerial, setLoggerSerial] = useState("")
  const [departureComment, setDepartureComment] = useState("")
  const [departureAlreadyPrepared, setDepartureAlreadyPrepared] = useState(false)
  const [detectedLogger, setDetectedLogger] = useState<{
    serial: string | null
    productId: string | null
    registeredLogger: VigilogLogger | null
  } | null>(null)
  const [autoDetectedSerial, setAutoDetectedSerial] = useState<string | null>(null)
  const [autoProbeAttempted, setAutoProbeAttempted] = useState(false)

  const [receiveTourneeId, setReceiveTourneeId] = useState("")
  const [receiveComment, setReceiveComment] = useState("")
  const [arrivalAlreadyPrepared, setArrivalAlreadyPrepared] = useState(false)
  const [departureDialogState, setDepartureDialogState] = useState<DepartureDialogState>({
    mode: "closed",
  })
  const [receiveDialogState, setReceiveDialogState] = useState<ReceiveDialogState>({
    mode: "closed",
  })

  const [historySearch, setHistorySearch] = useState("")
  const [historyStatus, setHistoryStatus] = useState("ALL")
  const [temporaryLocationName, setTemporaryLocationName] = useState("")
  const [usageNote, setUsageNote] = useState("")
  const [detailTourneeId, setDetailTourneeId] = useState<number | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [acknowledgeDialogTournee, setAcknowledgeDialogTournee] = useState<VigilogTournee | null>(null)
  const [acknowledgeComment, setAcknowledgeComment] = useState("")
  const [cancelDialogTournee, setCancelDialogTournee] = useState<VigilogTournee | null>(null)

  const sitesQuery = useSitesSimple(canAccess)
  const configurationsQuery = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => getJson<VigilogConfiguration[]>("/api/services/vigilog/configurations"),
    enabled: canAccess,
  })
  const loggersQuery = useQuery({
    queryKey: LOGGERS_QUERY_KEY,
    queryFn: () => getJson<VigilogLogger[]>("/api/services/vigilog/loggers"),
    enabled: canAccess,
  })
  const tourneesQuery = useQuery({
    queryKey: TOURNEES_QUERY_KEY,
    queryFn: () => getJson<VigilogTourneesResponse>("/api/services/vigilog/tournees?limit=100"),
    enabled: canAccess,
  })
  const temporaryUsagesQuery = useQuery({
    queryKey: TEMP_USAGES_QUERY_KEY,
    queryFn: () =>
      getJson<VigilogTemporaryUsagesResponse>("/api/services/vigilog/usages-ponctuels?limit=100"),
    enabled: canAccess,
  })
  const detailQuery = useQuery({
    queryKey: ["services", "vigilog", "tournees", detailTourneeId],
    queryFn: () => getJson<VigilogTourneeDetail>(`/api/services/vigilog/tournees/${detailTourneeId}`),
    enabled: canAccess && detailDialogOpen && detailTourneeId != null,
  })
  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data])
  const configurations = useMemo(() => configurationsQuery.data ?? [], [configurationsQuery.data])
  const loggers = useMemo(() => loggersQuery.data ?? [], [loggersQuery.data])
  const tourneesData = tourneesQuery.data
  const tournees = useMemo(() => tourneesData?.tournees ?? [], [tourneesData?.tournees])
  const temporaryUsagesData = temporaryUsagesQuery.data
  const temporaryUsages = useMemo(() => temporaryUsagesData?.usages ?? [], [temporaryUsagesData?.usages])

  const selectedConfigurationIdResolved = useMemo(() => {
    if (!selectedConfigurationId) return ""
    const stillExists = configurations.some((configuration) => String(configuration.id) === selectedConfigurationId)
    return stillExists ? selectedConfigurationId : ""
  }, [configurations, selectedConfigurationId])

  const departureSiteIdResolved = useMemo(() => {
    if (departureSiteId) return departureSiteId
    if (sites.length > 0) return String(sites[0].id)
    return ""
  }, [departureSiteId, sites])

  const arrivalSiteIdResolved = useMemo(() => {
    if (arrivalSiteId) return arrivalSiteId
    if (sites.length > 1) return String(sites[1].id)
    if (sites.length > 0) return String(sites[0].id)
    return ""
  }, [arrivalSiteId, sites])

  const pendingTournees = useMemo(
    () => tournees.filter((tournee) => tournee.status === "EN_ATTENTE_RECEPTION"),
    [tournees],
  )

  const detectedPendingTournee = useMemo(() => {
    const serial = (detectedLogger?.serial ?? autoDetectedSerial ?? loggerSerial).trim().toLowerCase()
    if (!serial) return null
    return (
      pendingTournees.find((tournee) => tournee.loggerSerial.trim().toLowerCase() === serial) ?? null
    )
  }, [autoDetectedSerial, detectedLogger?.serial, loggerSerial, pendingTournees])

  const pendingTourneesForArrival = useMemo(() => {
    if (!detectedPendingTournee) return pendingTournees

    return [
      detectedPendingTournee,
      ...pendingTournees.filter((tournee) => tournee.id !== detectedPendingTournee.id),
    ]
  }, [detectedPendingTournee, pendingTournees])

  useEffect(() => {
    if (!detailDialogOpen || !detailQuery.error) return
    toast({
      variant: "destructive",
      title: t("feedback.detailError.title"),
      description:
        detailQuery.error instanceof Error
          ? detailQuery.error.message
          : t("feedback.detailError.description"),
    })
  }, [detailDialogOpen, detailQuery.error, t, toast])

  const filteredHistory = useMemo(() => {
    const search = historySearch.trim().toLowerCase()
    return tournees.filter((tournee) => {
      if (historyStatus !== "ALL" && tournee.status !== historyStatus) return false
      if (!search) return true
      const haystack = [
        tournee.reference,
        tournee.configurationName,
        tournee.loggerSerial,
        tournee.departureSite.name,
        tournee.arrivalSite.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(search)
    })
  }, [historySearch, historyStatus, tournees])

  const invalidateVigilogData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: LOGGERS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: TOURNEES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: TEMP_USAGES_QUERY_KEY }),
    ])
  }

  const departureLoggerSerial = loggerSerial.trim()
  const detectedLoggerSerial = detectedLogger?.serial ?? null
  const resolvedLoggerSerial = (detectedLoggerSerial ?? loggerSerial).trim()
  const hasPendingTourneeForDepartureLogger =
    departureLoggerSerial.length > 0 &&
    pendingTournees.some(
      (tournee) => tournee.loggerSerial.trim().toLowerCase() === departureLoggerSerial.toLowerCase(),
    )
  const matchedLoggerBySerial =
    loggers.find((logger) => logger.serial.trim() === departureLoggerSerial) ?? null
  const matchedLoggerByResolvedSerial =
    loggers.find((logger) => logger.serial.trim() === resolvedLoggerSerial) ?? null
  const hasPendingTourneeForResolvedLogger =
    resolvedLoggerSerial.length > 0 &&
    pendingTournees.some(
      (tournee) => tournee.loggerSerial.trim().toLowerCase() === resolvedLoggerSerial.toLowerCase(),
    )
  const activeTemporaryUsages = useMemo(
    () => temporaryUsages.filter((usage) => usage.status === "EN_COURS"),
    [temporaryUsages],
  )
  const hasActiveTemporaryUsageForLogger =
    departureLoggerSerial.length > 0 &&
    activeTemporaryUsages.some(
      (usage) => usage.loggerSerial.trim().toLowerCase() === departureLoggerSerial.toLowerCase(),
    )

  const createConfigurationMutation = useMutation({
    mutationFn: (payload: Parameters<typeof postJson>[1]) =>
      postJson<{ id: number }>("/api/services/vigilog/configurations", payload),
    onSuccess: async () => {
      await invalidateVigilogData()
      setConfigurationDialogOpen(false)
      setEditingConfiguration(null)
      toast({
        title: t("feedback.configurationCreated.title"),
        description: t("feedback.configurationCreated.description"),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.configurationError.title"),
        description:
          error instanceof Error ? error.message : t("feedback.configurationError.description"),
      })
    },
  })

  const updateConfigurationMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof patchJson>[1] }) =>
      patchJson<{ id: number }>(`/api/services/vigilog/configurations/${id}`, payload),
    onSuccess: async () => {
      await invalidateVigilogData()
      setConfigurationDialogOpen(false)
      setEditingConfiguration(null)
      toast({
        title: t("feedback.configurationUpdated.title"),
        description: t("feedback.configurationUpdated.description"),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.configurationError.title"),
        description:
          error instanceof Error ? error.message : t("feedback.configurationError.description"),
      })
    },
  })

  const createLoggerMutation = useMutation({
    mutationFn: (payload: Parameters<typeof postJson>[1]) =>
      postJson<VigilogLogger>("/api/services/vigilog/loggers", payload),
    onSuccess: async (logger) => {
      await invalidateVigilogData()
      setLoggerDialogOpen(false)
      setEditingLogger(null)
      setLoggerDialogDefaults(null)
      setDetectedLogger((current) =>
        current && current.serial === logger.serial
          ? { ...current, registeredLogger: logger }
          : current,
      )
      toast({
        title: t("feedback.loggerCreated.title"),
        description: t("feedback.loggerCreated.description", { serial: logger.serial }),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.loggerError.title"),
        description: error instanceof Error ? error.message : t("feedback.loggerError.description"),
      })
    },
  })

  const updateLoggerMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof patchJson>[1] }) =>
      patchJson<VigilogLogger>(`/api/services/vigilog/loggers/${id}`, payload),
    onSuccess: async (logger) => {
      await invalidateVigilogData()
      setLoggerDialogOpen(false)
      setEditingLogger(null)
      setLoggerDialogDefaults(null)
      setDetectedLogger((current) =>
        current && current.serial === logger.serial
          ? { ...current, registeredLogger: logger }
          : current,
      )
      toast({
        title: t("feedback.loggerUpdated.title"),
        description: t("feedback.loggerUpdated.description", { serial: logger.serial }),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.loggerError.title"),
        description: error instanceof Error ? error.message : t("feedback.loggerError.description"),
      })
    },
  })

  const createTourneeMutation = useMutation({
    mutationFn: async () => {
      if (!departureLoggerSerial) {
        throw new Error(t("feedback.loggerSerialMissing.description"))
      }
      if (hasPendingTourneeForDepartureLogger) {
        throw new Error(t("feedback.departureError.pendingLogger"))
      }

      let serial = departureLoggerSerial
      if (!departureAlreadyPrepared) {
        if (!selectedConfiguration) {
          throw new Error(t("feedback.prepareError.description"))
        }
        const configureResult = await configureVigilogAgent({
          lowLimitActive: selectedConfiguration.lowLimitActive,
          lowLimit: selectedConfiguration.lowLimit,
          highLimitActive: selectedConfiguration.highLimitActive,
          highLimit: selectedConfiguration.highLimit,
          frequencyMinutes: selectedConfiguration.frequencyMinutes,
          alarmDelayMinutes: selectedConfiguration.alarmDelayMinutes,
          startDelayMinutes: selectedConfiguration.startDelayMinutes,
          stopButtonEnabled: selectedConfiguration.stopButtonEnabled,
          resetWithStartEnabled: selectedConfiguration.resetWithStartEnabled,
          startAutomatically: false,
        })
        const configuredSerial = (configureResult.loggerSerial || "").trim()
        if (configuredSerial) {
          serial = configuredSerial
          setLoggerSerial(configuredSerial)
          setAutoDetectedSerial(configuredSerial)
        }
      }

      return postJson<{ id: number; reference: string; status: string }>("/api/services/vigilog/tournees", {
        Id_VigiLog_Configuration: Number(selectedConfigurationIdResolved),
        Id_VigiLog: matchedLoggerBySerial?.id ?? detectedLogger?.registeredLogger?.id ?? null,
        Id_Site_Depart: Number(departureSiteIdResolved),
        Id_Site_Arrivee: Number(arrivalSiteIdResolved),
        Numero_Serie_VigiLog: serial,
        Commentaire: departureComment.trim() || null,
      })
    },
    onSuccess: async (data) => {
      await invalidateVigilogData()
      setDepartureAlreadyPrepared(false)
      toast({
        title: t("feedback.departureCreated.title"),
        description: t("feedback.departureCreated.description", { reference: data.reference }),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.departureError.title"),
        description: error instanceof Error ? error.message : t("feedback.departureError.description"),
      })
    },
  })

  const createArrivalTourneeMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedLoggerSerial) {
        throw new Error(t("feedback.loggerSerialMissing.description"))
      }
      if (hasPendingTourneeForResolvedLogger) {
        throw new Error(t("feedback.arrivalCreateError.pendingLogger"))
      }

      let serial = resolvedLoggerSerial
      if (!arrivalAlreadyPrepared) {
        if (!selectedConfiguration) {
          throw new Error(t("feedback.prepareError.description"))
        }
        const configureResult = await configureVigilogAgent({
          lowLimitActive: selectedConfiguration.lowLimitActive,
          lowLimit: selectedConfiguration.lowLimit,
          highLimitActive: selectedConfiguration.highLimitActive,
          highLimit: selectedConfiguration.highLimit,
          frequencyMinutes: selectedConfiguration.frequencyMinutes,
          alarmDelayMinutes: selectedConfiguration.alarmDelayMinutes,
          startDelayMinutes: selectedConfiguration.startDelayMinutes,
          stopButtonEnabled: selectedConfiguration.stopButtonEnabled,
          resetWithStartEnabled: selectedConfiguration.resetWithStartEnabled,
          startAutomatically: false,
        })
        const configuredSerial = (configureResult.loggerSerial || "").trim()
        if (configuredSerial) {
          serial = configuredSerial
          setLoggerSerial(configuredSerial)
          setAutoDetectedSerial(configuredSerial)
        }
      }

      return postJson<{ id: number; reference: string; status: string }>("/api/services/vigilog/tournees", {
        Id_VigiLog_Configuration: Number(selectedConfigurationIdResolved),
        Id_VigiLog:
          matchedLoggerByResolvedSerial?.id ??
          detectedLogger?.registeredLogger?.id ??
          null,
        Id_Site_Depart: Number(departureSiteIdResolved),
        Id_Site_Arrivee: Number(arrivalSiteIdResolved),
        Numero_Serie_VigiLog: serial,
        Commentaire: receiveComment.trim() || null,
      })
    },
    onSuccess: async (data) => {
      await invalidateVigilogData()
      setReceiveTourneeId(String(data.id))
      setArrivalAlreadyPrepared(false)
      toast({
        title: t("feedback.arrivalCreateSuccess.title"),
        description: t("feedback.arrivalCreateSuccess.description", {
          reference: data.reference,
        }),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.arrivalCreateError.title"),
        description:
          error instanceof Error ? error.message : t("feedback.arrivalCreateError.description"),
      })
    },
  })

  const prepareLoggerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConfigurationIdResolved) {
        throw new Error(t("feedback.prepareError.description"))
      }

      if (!selectedConfiguration) {
        throw new Error(t("feedback.prepareError.description"))
      }

      return configureVigilogAgent({
        lowLimitActive: selectedConfiguration.lowLimitActive,
        lowLimit: selectedConfiguration.lowLimit,
        highLimitActive: selectedConfiguration.highLimitActive,
        highLimit: selectedConfiguration.highLimit,
        frequencyMinutes: selectedConfiguration.frequencyMinutes,
        alarmDelayMinutes: selectedConfiguration.alarmDelayMinutes,
        startDelayMinutes: selectedConfiguration.startDelayMinutes,
        stopButtonEnabled: selectedConfiguration.stopButtonEnabled,
        resetWithStartEnabled: selectedConfiguration.resetWithStartEnabled,
        startAutomatically: false,
      })
    },
    onSuccess: async (data) => {
      await invalidateVigilogData()
      const serial = (data.loggerSerial || loggerSerial).trim()
      if (serial) {
        setLoggerSerial(serial)
        setAutoDetectedSerial(serial)
      }
      setDepartureDialogState({
        mode: "success",
        currentStep: 3,
        reference: serial || undefined,
      })
      toast({
        title: t("feedback.prepareSuccess.title"),
        description: data.loggerSerial
          ? t("feedback.prepareSuccess.description", { serial: data.loggerSerial })
          : t("feedback.prepareSuccess.fallback"),
      })
    },
    onError: (error) => {
      setDepartureDialogState((current) =>
        current.mode === "running"
          ? {
              ...current,
              mode: "error",
              error: error instanceof Error ? error.message : t("feedback.prepareError.description"),
            }
          : current,
      )
      toast({
        variant: "destructive",
        title: t("feedback.prepareError.title"),
        description: error instanceof Error ? error.message : t("feedback.prepareError.description"),
      })
    },
  })

  const startTemporaryUsageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConfigurationIdResolved) {
        throw new Error(t("feedback.prepareError.description"))
      }
      if (!departureLoggerSerial) {
        throw new Error(t("feedback.loggerSerialMissing.description"))
      }
      if (!temporaryLocationName.trim()) {
        throw new Error(t("feedback.temporaryUsageStartError.missingLocationName"))
      }
      if (hasActiveTemporaryUsageForLogger) {
        throw new Error(t("feedback.temporaryUsageStartError.loggerAlreadyActive"))
      }

      if (!selectedConfiguration) {
        throw new Error(t("feedback.prepareError.description"))
      }
      const configureResult = await configureVigilogAgent({
        lowLimitActive: selectedConfiguration.lowLimitActive,
        lowLimit: selectedConfiguration.lowLimit,
        highLimitActive: selectedConfiguration.highLimitActive,
        highLimit: selectedConfiguration.highLimit,
        frequencyMinutes: selectedConfiguration.frequencyMinutes,
        alarmDelayMinutes: selectedConfiguration.alarmDelayMinutes,
        startDelayMinutes: selectedConfiguration.startDelayMinutes,
        stopButtonEnabled: selectedConfiguration.stopButtonEnabled,
        resetWithStartEnabled: selectedConfiguration.resetWithStartEnabled,
        startAutomatically: false,
      })
      const configuredSerial = (configureResult.loggerSerial || departureLoggerSerial).trim()

      const createdUsage = await postJson<{ id: number; reference: string; status: string }>(
        "/api/services/vigilog/usages-ponctuels",
        {
          Id_VigiLog_Configuration: Number(selectedConfigurationIdResolved),
          Id_VigiLog: matchedLoggerBySerial?.id ?? detectedLogger?.registeredLogger?.id ?? null,
          Numero_Serie_VigiLog: configuredSerial,
          Nom_Lieu_Temporaire: temporaryLocationName.trim(),
          Commentaire_Demarrage: usageNote.trim() || null,
        },
      )

      return { createdUsage, configuredSerial }
    },
    onSuccess: async ({ createdUsage, configuredSerial }) => {
      await invalidateVigilogData()
      setLoggerSerial(configuredSerial)
      setAutoDetectedSerial(configuredSerial)
      setUsageNote("")
      setTemporaryLocationName("")
      toast({
        title: t("feedback.temporaryUsageStartSuccess.title"),
        description: t("feedback.temporaryUsageStartSuccess.description", {
          reference: createdUsage.reference,
        }),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.temporaryUsageStartError.title"),
        description:
          error instanceof Error
            ? error.message
            : t("feedback.temporaryUsageStartError.description"),
      })
    },
  })

  const stopTemporaryUsageMutation = useMutation({
    mutationFn: async (usage: VigilogTemporaryUsage) =>
      postJson<{
        id: number
        status: string
        stoppedAt: string
        clearedFromAgent: boolean
        clearDetails: string | null
      }>(`/api/services/vigilog/usages-ponctuels/${usage.id}/stop`, {
        Commentaire_Arret: null,
      }),
    onSuccess: async () => {
      await invalidateVigilogData()
      toast({
        title: t("feedback.temporaryUsageStopSuccess.title"),
        description: t("feedback.temporaryUsageStopSuccess.description"),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.temporaryUsageStopError.title"),
        description:
          error instanceof Error ? error.message : t("feedback.temporaryUsageStopError.description"),
      })
    },
  })

  const receiveMutation = useMutation({
    mutationFn: async () => {
      const agentResponse = await readVigilogAgent()
      if (!agentResponse.res) {
        throw new Error(agentResponse.details || t("feedback.receiveError.description"))
      }

      const agentSerial = (agentResponse.loggerSerial || "").trim()
      const expectedSerial = (selectedReceiveTournee?.loggerSerial || "").trim()
      if (agentSerial && expectedSerial && agentSerial !== expectedSerial) {
        throw new Error(t("feedback.receiveError.serialMismatch"))
      }

      const persisted = await postJson<{
        id: number
        status: string
        arrivalAt: string | null
        trafficLight: VigilogTournee["trafficLight"]
        measurementCount: number
        hasAlarm: boolean
      }>(`/api/services/vigilog/tournees/${receiveTourneeId}/receive`, {
        Commentaire: receiveComment.trim() || null,
        Mesures: agentResponse.measures,
      })

      let clearedAfterReceive = false
      let clearDetails: string | null = null
      try {
        const clearResponse = await clearVigilogAgent()
        clearedAfterReceive = clearResponse.res
        clearDetails = clearResponse.details
      } catch (error) {
        clearDetails = error instanceof Error ? error.message : null
      }

      return {
        ...persisted,
        loggerSerial: agentSerial || expectedSerial || null,
        clearedAfterReceive,
        clearDetails,
      }
    },
    onSuccess: async (data) => {
      setReceiveDialogState({ mode: "closed" })
      await invalidateVigilogData()
      setReceiveComment("")
      setReceiveTourneeId("")
      openTourneeDetail(data.id)
      toast({
        title:
          data.measurementCount > 0
            ? t("feedback.receiveSuccess.title")
            : t("feedback.receiveSuccessEmpty.title"),
        description:
          data.measurementCount > 0
            ? t("feedback.receiveSuccess.description")
            : t("feedback.receiveSuccessEmpty.description"),
      })
    },
    onError: (error) => {
      setReceiveDialogState((current) =>
        current.mode === "running"
          ? {
              ...current,
              mode: "error",
              error: error instanceof Error ? error.message : t("feedback.receiveError.description"),
            }
          : current,
      )
      toast({
        variant: "destructive",
        title: t("feedback.receiveError.title"),
        description: error instanceof Error ? error.message : t("feedback.receiveError.description"),
      })
    },
  })

  const acknowledgeMutation = useMutation({
    mutationFn: ({ tourneeId, comment }: { tourneeId: number; comment: string | null }) =>
      postJson(`/api/services/vigilog/tournees/${tourneeId}/acknowledge`, {
        Commentaire_Acquittement: comment,
      }),
    onSuccess: async () => {
      await invalidateVigilogData()
      setAcknowledgeDialogTournee(null)
      setAcknowledgeComment("")
      toast({
        title: t("feedback.ackSuccess.title"),
        description: t("feedback.ackSuccess.description"),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.ackError.title"),
        description: error instanceof Error ? error.message : t("feedback.ackError.description"),
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (tourneeId: number) =>
      postJson<{ id: number; status: string }>(`/api/services/vigilog/tournees/${tourneeId}/cancel`, {}),
    onSuccess: async (data) => {
      await invalidateVigilogData()
      if (receiveTourneeId === String(data.id)) {
        setReceiveTourneeId("")
      }
      setCancelDialogTournee(null)
      toast({
        title: t("feedback.cancelSuccess.title"),
        description: t("feedback.cancelSuccess.description"),
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("feedback.cancelError.title"),
        description: error instanceof Error ? error.message : t("feedback.cancelError.description"),
      })
    },
  })

  const isCradleBusy =
    prepareLoggerMutation.isPending ||
    startTemporaryUsageMutation.isPending ||
    stopTemporaryUsageMutation.isPending ||
    departureDialogState.mode === "running" ||
    receiveMutation.isPending
  const shouldAutoProbe =
    canAccess && !isCradleBusy && (activeTab === "movements" || activeTab === "usage" || activeTab === "loggers")
  const autoPresenceQuery = useQuery({
    queryKey: AGENT_PRESENCE_QUERY_KEY,
    queryFn: async () => {
      try {
        return await presenceVigilogAgent()
      } catch {
        return {
          res: false,
          details: "Presence check unavailable",
          step: null,
        }
      }
    },
    enabled: shouldAutoProbe,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: shouldAutoProbe ? AUTO_PROBE_INTERVAL_MS : false,
  })

  const probeMutation = useMutation({
    mutationFn: async (_options?: { silent?: boolean }) => {
      const response = await probeVigilogAgent()
      if (!response.res) {
        throw new Error(response.details || t("feedback.probeError.description"))
      }

      const registeredLogger = response.loggerSerial
        ? (loggers.find((logger) => logger.serial === response.loggerSerial) ?? null)
        : null

      return {
        loggerSerial: response.loggerSerial,
        productId: response.productId,
        frequencyMinutes: response.frequencyMinutes,
        alarmDelayMinutes: response.alarmDelayMinutes,
        registeredLogger,
      }
    },
    onSuccess: (data, variables) => {
      if (data.loggerSerial) {
        setLoggerSerial(data.loggerSerial)
        setAutoDetectedSerial(data.loggerSerial)
      }
      setDetectedLogger({
        serial: data.loggerSerial,
        productId: data.productId,
        registeredLogger: data.registeredLogger,
      })
      if (!variables?.silent) {
        toast({
          title: t("feedback.probeSuccess.title"),
          description: data.loggerSerial
            ? t("feedback.probeSuccess.description", { serial: data.loggerSerial })
            : t("feedback.probeSuccess.fallback"),
        })
      }
    },
    onError: (error, variables) => {
      setDetectedLogger(null)
      setAutoProbeAttempted(false)
      setAutoDetectedSerial((currentAutoDetectedSerial) => {
        if (!currentAutoDetectedSerial) return null
        setLoggerSerial((currentSerial) =>
          currentSerial.trim() === currentAutoDetectedSerial ? "" : currentSerial,
        )
        return null
      })
      if (!variables?.silent) {
        toast({
          variant: "destructive",
          title: t("feedback.probeError.title"),
          description: error instanceof Error ? error.message : t("feedback.probeError.description"),
        })
      }
    },
  })

  const loggerStatus = useMemo(() => {
    if (isCradleBusy) {
      return {
        tone: "loading" as const,
        title: t("departure.loggerState.busyTitle"),
        description: t("departure.loggerState.busyDescription"),
      }
    }
    if (probeMutation.isPending) {
      return {
        tone: "loading" as const,
        title: t("departure.loggerState.loadingTitle"),
        description: t("departure.loggerState.loadingDescription"),
      }
    }

    const presence = autoPresenceQuery.data
    const normalizedPresenceDetails = normalizePresenceDetails(presence?.details)
    if (!presence) {
      return {
        tone: "loading" as const,
        title: t("departure.loggerState.loadingTitle"),
        description: t("departure.loggerState.loadingDescription"),
      }
    }

    if (presence.res && detectedLoggerSerial) {
      return {
        tone: "ready" as const,
        title: t("departure.loggerState.readyTitle"),
        description: t("departure.loggerState.readyDescription", {
          serial: detectedLoggerSerial,
        }),
      }
    }

    if (normalizedPresenceDetails === "base branchee sans vigilog") {
      return {
        tone: "base-only" as const,
        title: t("departure.loggerState.baseOnlyTitle"),
        description: t("departure.loggerState.baseOnlyDescription"),
      }
    }

    if (normalizedPresenceDetails === "aucune base vigilog detectee") {
      return {
        tone: "missing" as const,
        title: t("departure.loggerState.missingTitle"),
        description: t("departure.loggerState.missingDescription"),
      }
    }

    return {
      tone: "error" as const,
      title: t("departure.loggerState.errorTitle"),
      description: presence.details || t("departure.loggerState.errorDescription"),
    }
  }, [autoPresenceQuery.data, detectedLoggerSerial, isCradleBusy, probeMutation.isPending, t])

  useEffect(() => {
    const presence = autoPresenceQuery.data
    if (!presence) return

    if (!presence.res) {
      const resetId = window.setTimeout(() => {
        setDetectedLogger(null)
        setAutoProbeAttempted(false)
        setAutoDetectedSerial((currentAutoDetectedSerial) => {
          if (!currentAutoDetectedSerial) return null
          setLoggerSerial((currentSerial) =>
            currentSerial.trim() === currentAutoDetectedSerial ? "" : currentSerial,
          )
          return null
        })
      }, 0)
      return () => {
        window.clearTimeout(resetId)
      }
    }

    if (!autoProbeAttempted && !probeMutation.isPending && !detectedLogger?.serial) {
      const probeId = window.setTimeout(() => {
        setAutoProbeAttempted(true)
        probeMutation.mutate({ silent: true })
      }, 0)
      return () => {
        window.clearTimeout(probeId)
      }
    }

    return
  }, [autoPresenceQuery.data, autoProbeAttempted, detectedLogger?.serial, probeMutation])

  useEffect(() => {
    if (departureDialogState.mode !== "running") return

    const timers = [
      window.setTimeout(() => {
        setDepartureDialogState((current) =>
          current.mode === "running" ? { ...current, currentStep: Math.max(current.currentStep, 2) } : current,
        )
      }, 900),
      window.setTimeout(() => {
        setDepartureDialogState((current) =>
          current.mode === "running" ? { ...current, currentStep: Math.max(current.currentStep, 3) } : current,
        )
      }, 1800),
    ]

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [departureDialogState])

  useEffect(() => {
    if (receiveDialogState.mode !== "running") return

    const timers = [
      window.setTimeout(() => {
        setReceiveDialogState((current) =>
          current.mode === "running" ? { ...current, currentStep: Math.max(current.currentStep, 2) } : current,
        )
      }, 1200),
      window.setTimeout(() => {
        setReceiveDialogState((current) =>
          current.mode === "running" ? { ...current, currentStep: Math.max(current.currentStep, 3) } : current,
        )
      }, 3600),
      window.setTimeout(() => {
        setReceiveDialogState((current) =>
          current.mode === "running" ? { ...current, currentStep: Math.max(current.currentStep, 4) } : current,
        )
      }, 7600),
    ]

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [receiveDialogState])

  const selectedConfiguration = configurations.find(
    (configuration) => String(configuration.id) === selectedConfigurationIdResolved,
  )
  const selectedReceiveTournee = pendingTournees.find(
    (tournee) => String(tournee.id) === receiveTourneeId,
  )
  const receiveSerialMismatch =
    !!selectedReceiveTournee?.loggerSerial &&
    !!detectedLogger?.serial &&
    selectedReceiveTournee.loggerSerial.trim() !== detectedLogger.serial.trim()
  const canSubmitReception =
    !receiveMutation.isPending &&
    !!receiveTourneeId &&
    loggerStatus.tone === "ready" &&
    !!detectedLogger?.serial &&
    !receiveSerialMismatch
  const canCreateDepartureTournee =
    !createTourneeMutation.isPending &&
    !!selectedConfigurationIdResolved &&
    !!departureSiteIdResolved &&
    !!arrivalSiteIdResolved &&
    !!departureLoggerSerial &&
    (departureAlreadyPrepared || loggerStatus.tone === "ready") &&
    !hasPendingTourneeForDepartureLogger
  const canCreateTourneeAtArrival =
    !createArrivalTourneeMutation.isPending &&
    !!selectedConfigurationIdResolved &&
    !!departureSiteIdResolved &&
    !!arrivalSiteIdResolved &&
    !!resolvedLoggerSerial &&
    (arrivalAlreadyPrepared || loggerStatus.tone === "ready") &&
    !hasPendingTourneeForResolvedLogger
  const canStartTemporaryUsage =
    !startTemporaryUsageMutation.isPending &&
    !!selectedConfigurationIdResolved &&
    !!departureLoggerSerial &&
    !!temporaryLocationName.trim() &&
    loggerStatus.tone === "ready" &&
    !hasActiveTemporaryUsageForLogger

  const openTourneeDetail = useCallback((tourneeId: number) => {
    setDetailTourneeId(tourneeId)
    setDetailDialogOpen(true)
  }, [])

  const historyColumns: ColumnDef<VigilogTournee>[] = [
      {
        accessorKey: "reference",
        header: t("history.columns.reference"),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.reference}</div>
            <div className="text-xs text-muted-foreground">{row.original.loggerSerial}</div>
          </div>
        ),
      },
      {
        id: "route",
        header: t("history.columns.route"),
        cell: ({ row }) => (
          <div>
            <div>{row.original.departureSite.name || "-"}</div>
            <div className="text-xs text-muted-foreground">
              {"->"} {row.original.arrivalSite.name || "-"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("history.columns.status"),
        cell: ({ row }) => (
          <Badge variant="outline" className={statusBadgeClass(row.original.status)}>
            {t(`history.status.${row.original.status.toLowerCase()}` as never)}
          </Badge>
        ),
      },
      {
        id: "trafficLight",
        header: t("history.columns.result"),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${trafficLightClass(row.original.trafficLight)}`} />
              <span className="text-sm text-foreground">
                {row.original.trafficLight
                  ? t(`history.traffic.${row.original.trafficLight.toLowerCase()}` as never)
                  : "-"}
              </span>
            </div>
            {row.original.hasAlarm ? (
              <p className="mt-1 text-xs text-rose-600">
                {t("history.alarm", {
                  duration: formatDuration(row.original.alarmDurationSeconds),
                })}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: "measures",
        header: t("history.columns.measures"),
        cell: ({ row }) => (
          <div>
            <div className="text-foreground">{row.original.measurementCount}</div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(row.original.temperatureMin)} / {formatNumber(row.original.temperatureMax)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "departureAt",
        header: t("history.columns.departureAt"),
        cell: ({ row }) => formatDateTime(row.original.departureAt, locale),
      },
      {
        accessorKey: "arrivalAt",
        header: t("history.columns.arrivalAt"),
        cell: ({ row }) => formatDateTime(row.original.arrivalAt, locale),
      },
      {
        id: "actions",
        header: t("history.columns.actions"),
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {row.original.status === "EN_ATTENTE_RECEPTION" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className={vigilogBlueActionButtonClass}
                  onClick={() => {
                    setReceiveTourneeId(String(row.original.id))
                    setActiveTab("movements")
                  }}
                >
                  {t("history.actions.receive")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={vigilogActionButtonSecondaryShadowClass}
                  onClick={() => setCancelDialogTournee(row.original)}
                >
                  {t("history.actions.cancelTour")}
                </Button>
              </>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              className={vigilogBlueActionButtonClass}
              onClick={() => openTourneeDetail(row.original.id)}
            >
              {t("history.actions.details")}
            </Button>
            {row.original.hasAlarm && !row.original.acknowledged ? (
              <Button
                size="sm"
                className={vigilogAmberButtonClass}
                onClick={() => {
                  setAcknowledgeDialogTournee(row.original)
                  setAcknowledgeComment(row.original.acknowledgeComment || "")
                }}
                disabled={acknowledgeMutation.isPending}
              >
                {t("history.actions.acknowledge")}
              </Button>
            ) : null}
          </div>
        ),
      },
    ]

  const startDeparturePreparation = () => {
    setDepartureDialogState({
      mode: "running",
      currentStep: 1,
    })
    prepareLoggerMutation.mutate()
  }

  const startReceivePreparation = () => {
    setReceiveDialogState({
      mode: "running",
      currentStep: 1,
    })
    receiveMutation.mutate()
  }
  const departureRunState =
    departureDialogState.mode === "running" ||
    departureDialogState.mode === "success" ||
    departureDialogState.mode === "error"
      ? departureDialogState
      : null
  const receiveRunState =
    receiveDialogState.mode === "running" || receiveDialogState.mode === "error"
      ? receiveDialogState
      : null

  if (accessLoading) {
    return (
      <div className="relative min-h-screen bg-background">
        <DotPattern className="opacity-30" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white/90 dark:bg-white/95 px-5 py-4 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="relative min-h-screen bg-background">
        <DotPattern className="opacity-30" />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
          <Card className="w-full border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>{t("forbidden.title")}</CardTitle>
              <CardDescription>{t("forbidden.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t("forbidden.alertTitle")}</AlertTitle>
                <AlertDescription>{t("forbidden.alertDescription")}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background">
      <DotPattern className="opacity-30" />

      <main className="relative z-10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
            <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("hero.eyebrow")}</p>
                <CardTitle className="text-3xl">{t("hero.title")}</CardTitle>
                <CardDescription className="text-base">{t("hero.description")}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>{t("stats.configurations")}</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileCog className="h-5 w-5 text-primary" />
                    {configurations.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>{t("stats.pending")}</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Truck className="h-5 w-5 text-primary" />
                    {tourneesData?.stats.pendingCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>{t("stats.alarms")}</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    {tourneesData?.stats.activeAlarmCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardHeader className="pb-3">
                  <CardDescription>{t("stats.occasionalUsage")}</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <PackageCheck className="h-5 w-5 text-primary" />
                    {temporaryUsagesData?.stats.activeCount ?? 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-primary/10 text-primary md:w-230">
              <TabsTrigger value="movements">{t("tabs.movements")}</TabsTrigger>
              <TabsTrigger value="usage">{t("tabs.usage")}</TabsTrigger>
              <TabsTrigger value="configurations">{t("tabs.configurations")}</TabsTrigger>
              <TabsTrigger value="loggers">{t("tabs.loggers")}</TabsTrigger>
              <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
            </TabsList>

            <TabsContent value="movements" className="mt-6 space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-primary" />
                      {t("departure.title")}
                    </CardTitle>
                    <CardDescription>{t("departure.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("departure.fields.configuration")}</Label>
                        <Combobox
                          value={selectedConfigurationIdResolved}
                          onValueChange={setSelectedConfigurationId}
                          placeholder={t("departure.placeholders.configuration")}
                          searchPlaceholder={t("departure.placeholders.configurationSearch")}
                          emptyMessage={t("departure.placeholders.configurationEmpty")}
                          buttonClassName={vigilogComboboxButtonClass}
                          className={vigilogComboboxPopoverClass}
                          options={configurations
                            .filter((configuration) => configuration.active)
                            .map((configuration) => ({
                              value: String(configuration.id),
                              label: configuration.name,
                              searchText: `${configuration.name} ${configuration.description ?? ""}`,
                            }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("departure.fields.loggerSerial")}</Label>
                        <Input
                          value={loggerSerial}
                          onChange={(event) => {
                            setLoggerSerial(event.target.value)
                            setAutoDetectedSerial(null)
                            setDetectedLogger((current) =>
                              current?.serial === event.target.value ? current : null,
                            )
                          }}
                          placeholder={t("departure.placeholders.loggerSerial")}
                          maxLength={30}
                        />
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border px-3 py-3 text-sm ${loggerStatusClasses(loggerStatus.tone)}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{loggerStatus.title}</p>
                          <p className="text-xs/5 opacity-90">{loggerStatus.description}</p>
                          <p className="text-xs/5 opacity-90">{t("departure.loggerState.optionalHint")}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`shrink-0 shadow-[0_6px_18px_rgba(15,23,42,0.08)] ${
                            loggerStatus.tone === "ready"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100"
                              : loggerStatus.tone === "base-only"
                                ? "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100"
                                : loggerStatus.tone === "error"
                                  ? "border-rose-200 bg-rose-50 text-rose-950 hover:bg-rose-100"
                                  : loggerStatus.tone === "loading"
                                    ? "border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
                          }`}
                          disabled={probeMutation.isPending || isCradleBusy}
                          onClick={() => probeMutation.mutate({ silent: false })}
                        >
                          {probeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t("departure.actions.refreshLogger")
                          )}
                        </Button>
                      </div>
                    </div>

                    {loggerSerial.trim() ? (
                      matchedLoggerBySerial ? (
                        <Alert>
                          <Truck className="h-4 w-4" />
                          <AlertTitle>{t("departure.loggerRegistered.title")}</AlertTitle>
                          <AlertDescription>
                            {t("departure.loggerRegistered.description", {
                              serial: matchedLoggerBySerial.serial,
                            })}
                          </AlertDescription>
                        </Alert>
                      ) : detectedLogger?.serial === loggerSerial.trim() ? (
                        <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{t("departure.loggerUnknown.title")}</AlertTitle>
                          <AlertDescription className="space-y-3">
                            <p>
                              {t("departure.loggerUnknown.description", {
                                serial: detectedLogger.serial ?? loggerSerial.trim(),
                              })}
                            </p>
                            {canManageConfigurations ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className={vigilogActionButtonSecondaryShadowClass}
                                onClick={() => {
                                  setEditingLogger(null)
                                  setLoggerDialogDefaults({
                                    serial: detectedLogger.serial ?? loggerSerial.trim(),
                                    model: detectedLogger.productId ?? "",
                                  })
                                  setLoggerDialogOpen(true)
                                  setActiveTab("loggers")
                                }}
                              >
                                {t("departure.loggerUnknown.register")}
                              </Button>
                            ) : null}
                          </AlertDescription>
                        </Alert>
                      ) : null
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("departure.fields.departureSite")}</Label>
                        <Combobox
                          value={departureSiteIdResolved}
                          onValueChange={setDepartureSiteId}
                          placeholder={t("departure.placeholders.site")}
                          searchPlaceholder={t("departure.placeholders.siteSearch")}
                          emptyMessage={t("departure.placeholders.siteEmpty")}
                          buttonClassName={vigilogComboboxButtonClass}
                          className={vigilogComboboxPopoverClass}
                          options={sites.map((site) => ({
                            value: String(site.id),
                            label: site.name,
                            searchText: site.name,
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("departure.fields.arrivalSite")}</Label>
                        <Combobox
                          value={arrivalSiteIdResolved}
                          onValueChange={setArrivalSiteId}
                          placeholder={t("departure.placeholders.site")}
                          searchPlaceholder={t("departure.placeholders.siteSearch")}
                          emptyMessage={t("departure.placeholders.siteEmpty")}
                          buttonClassName={vigilogComboboxButtonClass}
                          className={vigilogComboboxPopoverClass}
                          options={sites.map((site) => ({
                            value: String(site.id),
                            label: site.name,
                            searchText: site.name,
                          }))}
                        />
                      </div>
                    </div>

                    {selectedConfiguration ? (
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100">
                            {selectedConfiguration.name}
                          </Badge>
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100">
                            {t("common.frequencyBadge", { count: selectedConfiguration.frequencyMinutes })}
                          </Badge>
                          <Badge className="border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100">
                            {t("common.delayBadge", { count: selectedConfiguration.alarmDelayMinutes })}
                          </Badge>
                        </div>
                        <p className="mt-3 text-muted-foreground">
                          {selectedConfiguration.description || t("common.noDescription")}
                        </p>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label>{t("departure.fields.comment")}</Label>
                      <Textarea
                        value={departureComment}
                        onChange={(event) => setDepartureComment(event.target.value)}
                        rows={4}
                        placeholder={t("departure.placeholders.comment")}
                      />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="departure-already-prepared"
                          checked={departureAlreadyPrepared}
                          onCheckedChange={(checked) => setDepartureAlreadyPrepared(checked === true)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="departure-already-prepared" className="cursor-pointer">
                            {t("departure.fields.alreadyPrepared")}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {t("departure.hints.alreadyPrepared")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasPendingTourneeForDepartureLogger ? (
                      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("arrival.warnings.pendingLoggerTitle")}</AlertTitle>
                        <AlertDescription>{t("arrival.warnings.pendingLoggerDescription")}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      <Button
                        className={`w-full ${vigilogBluePrimaryButtonClass}`}
                        disabled={!canCreateDepartureTournee}
                        onClick={() => createTourneeMutation.mutate()}
                      >
                        {createTourneeMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Truck className="mr-2 h-4 w-4" />
                        )}
                        {t("departure.actions.submit")}
                      </Button>
                      <Button
                        variant="outline"
                        className={`w-full ${vigilogBlueActionButtonClass}`}
                        disabled={
                          prepareLoggerMutation.isPending ||
                          !selectedConfigurationIdResolved ||
                          loggerStatus.tone !== "ready"
                        }
                        onClick={startDeparturePreparation}
                      >
                        {prepareLoggerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileCog className="mr-2 h-4 w-4" />
                        )}
                        {t("departure.actions.prepareLogger")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PackageCheck className="h-5 w-5 text-primary" />
                      {t("arrival.title")}
                    </CardTitle>
                    <CardDescription>{t("arrival.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detectedPendingTournee ? (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950 shadow-[0_8px_24px_rgba(14,165,233,0.08)]">
                        <p className="font-semibold">{t("arrival.detectedMatch.title")}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <p>
                            {t("arrival.detectedMatch.reference")}: {detectedPendingTournee.reference}
                          </p>
                          <p>
                            {t("arrival.detectedMatch.loggerSerial")}: {detectedPendingTournee.loggerSerial}
                          </p>
                          <p>
                            {t("arrival.detectedMatch.departureSite")}: {detectedPendingTournee.departureSite.name || "-"}
                          </p>
                          <p>
                            {t("arrival.detectedMatch.departureAt")}: {formatDateTime(detectedPendingTournee.departureAt, locale)}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label>{t("arrival.fields.pendingTour")}</Label>
                      <Combobox
                        value={receiveTourneeId}
                        onValueChange={setReceiveTourneeId}
                        placeholder={t("arrival.placeholders.pendingTour")}
                        searchPlaceholder={t("arrival.placeholders.pendingTourSearch")}
                        emptyMessage={t("arrival.placeholders.pendingTourEmpty")}
                        buttonClassName={vigilogComboboxButtonClass}
                        className={vigilogComboboxPopoverClass}
                        options={pendingTourneesForArrival.map((tournee) => ({
                          value: String(tournee.id),
                          label:
                            detectedPendingTournee?.id === tournee.id
                              ? `${tournee.reference} - ${tournee.loggerSerial} - ${t("arrival.detectedMatch.optionSuffix")}`
                              : `${tournee.reference} - ${tournee.loggerSerial}`,
                          searchText: `${tournee.reference} ${tournee.loggerSerial} ${tournee.departureSite.name} ${tournee.arrivalSite.name}`,
                          className:
                            detectedPendingTournee?.id === tournee.id
                              ? "bg-sky-50 text-sky-950 border border-sky-200 my-1 rounded-md"
                              : undefined,
                        }))}
                      />
                    </div>

                    {receiveTourneeId ? (
                      (() => {
                        if (!selectedReceiveTournee) return null
                        return (
                          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{selectedReceiveTournee.reference}</Badge>
                              <Badge variant="secondary">{selectedReceiveTournee.configurationName}</Badge>
                            </div>
                            <div className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
                              <p>
                                {t("arrival.summary.departureSite")}: {selectedReceiveTournee.departureSite.name || "-"}
                              </p>
                              <p>
                                {t("arrival.summary.arrivalSite")}: {selectedReceiveTournee.arrivalSite.name || "-"}
                              </p>
                              <p>
                                {t("arrival.summary.departureAt")}: {formatDateTime(selectedReceiveTournee.departureAt, locale)}
                              </p>
                              <p>
                                {t("arrival.summary.loggerSerial")}: {selectedReceiveTournee.loggerSerial}
                              </p>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("arrival.emptyTitle")}</AlertTitle>
                        <AlertDescription>{t("arrival.emptyDescription")}</AlertDescription>
                      </Alert>
                    )}

                    {loggerStatus.tone !== "ready" ? (
                      <Alert className="border-rose-200 bg-rose-50 text-rose-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("arrival.warnings.noLoggerTitle")}</AlertTitle>
                        <AlertDescription>{t("arrival.warnings.noLoggerDescription")}</AlertDescription>
                      </Alert>
                    ) : null}

                    {receiveSerialMismatch && selectedReceiveTournee ? (
                      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("arrival.warnings.mismatchTitle")}</AlertTitle>
                        <AlertDescription>
                          {t("arrival.warnings.mismatchDescription", {
                            expected: selectedReceiveTournee.loggerSerial,
                            detected: detectedLogger?.serial ?? "-",
                          })}
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="space-y-2">
                      <Label>{t("arrival.fields.comment")}</Label>
                      <Textarea
                        value={receiveComment}
                        onChange={(event) => setReceiveComment(event.target.value)}
                        rows={4}
                        placeholder={t("arrival.placeholders.comment")}
                      />
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="arrival-already-prepared"
                          checked={arrivalAlreadyPrepared}
                          onCheckedChange={(checked) => setArrivalAlreadyPrepared(checked === true)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="arrival-already-prepared" className="cursor-pointer">
                            {t("arrival.fields.alreadyPrepared")}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {t("arrival.hints.alreadyPrepared")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasPendingTourneeForResolvedLogger ? (
                      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("arrival.warnings.pendingLoggerTitle")}</AlertTitle>
                        <AlertDescription>{t("arrival.warnings.pendingLoggerDescription")}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      <Button
                        className={`w-full ${vigilogBluePrimaryButtonClass}`}
                        disabled={!canSubmitReception}
                        onClick={startReceivePreparation}
                      >
                        {receiveMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PackageCheck className="mr-2 h-4 w-4" />
                        )}
                        {t("arrival.actions.submit")}
                      </Button>
                      <Button
                        variant="outline"
                        className={`w-full ${vigilogBlueActionButtonClass}`}
                        disabled={!canCreateTourneeAtArrival}
                        onClick={() => createArrivalTourneeMutation.mutate()}
                      >
                        {createArrivalTourneeMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Truck className="mr-2 h-4 w-4" />
                        )}
                        {t("arrival.actions.createAtArrival")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="mt-6 space-y-6">
              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCog className="h-5 w-5 text-primary" />
                    {t("usage.title")}
                  </CardTitle>
                  <CardDescription>{t("usage.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-sky-200 bg-sky-50 text-sky-950">
                    <FileCog className="h-4 w-4" />
                    <AlertTitle>{t("usage.infoTitle")}</AlertTitle>
                    <AlertDescription>{t("usage.infoDescription")}</AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("usage.fields.configuration")}</Label>
                      <Combobox
                        value={selectedConfigurationIdResolved}
                        onValueChange={setSelectedConfigurationId}
                        placeholder={t("departure.placeholders.configuration")}
                        searchPlaceholder={t("departure.placeholders.configurationSearch")}
                        emptyMessage={t("departure.placeholders.configurationEmpty")}
                        buttonClassName={vigilogComboboxButtonClass}
                        className={vigilogComboboxPopoverClass}
                        options={configurations
                          .filter((configuration) => configuration.active)
                          .map((configuration) => ({
                            value: String(configuration.id),
                            label: configuration.name,
                            searchText: `${configuration.name} ${configuration.description ?? ""}`,
                          }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("usage.fields.loggerSerial")}</Label>
                      <Input
                        value={loggerSerial}
                        onChange={(event) => {
                          setLoggerSerial(event.target.value)
                          setAutoDetectedSerial(null)
                          setDetectedLogger((current) =>
                            current?.serial === event.target.value ? current : null,
                          )
                        }}
                        placeholder={t("departure.placeholders.loggerSerial")}
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div className={`rounded-xl border px-3 py-3 text-sm ${loggerStatusClasses(loggerStatus.tone)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{loggerStatus.title}</p>
                        <p className="text-xs/5 opacity-90">{loggerStatus.description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={vigilogBlueActionButtonClass}
                        disabled={probeMutation.isPending || isCradleBusy}
                        onClick={() => probeMutation.mutate({ silent: false })}
                      >
                        {probeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("departure.actions.refreshLogger")}
                      </Button>
                    </div>
                  </div>

                  {selectedConfiguration ? (
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100">
                          {selectedConfiguration.name}
                        </Badge>
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100">
                          {t("common.frequencyBadge", { count: selectedConfiguration.frequencyMinutes })}
                        </Badge>
                        <Badge className="border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100">
                          {t("common.delayBadge", { count: selectedConfiguration.alarmDelayMinutes })}
                        </Badge>
                      </div>
                      <p className="mt-3 text-muted-foreground">
                        {selectedConfiguration.description || t("common.noDescription")}
                      </p>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label>{t("usage.fields.temporaryLocationName")}</Label>
                    <Input
                      value={temporaryLocationName}
                      onChange={(event) => setTemporaryLocationName(event.target.value)}
                      placeholder={t("usage.placeholders.temporaryLocationName")}
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("usage.fields.note")}</Label>
                    <Textarea
                      value={usageNote}
                      onChange={(event) => setUsageNote(event.target.value)}
                      rows={4}
                      placeholder={t("usage.placeholders.note")}
                    />
                    <p className="text-xs text-muted-foreground">{t("usage.noteHint")}</p>
                  </div>

                  {hasActiveTemporaryUsageForLogger ? (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{t("usage.warnings.loggerAlreadyActiveTitle")}</AlertTitle>
                      <AlertDescription>{t("usage.warnings.loggerAlreadyActiveDescription")}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Button
                    variant="outline"
                    className={`w-full ${vigilogBlueActionButtonClass}`}
                    disabled={!canStartTemporaryUsage}
                    onClick={() => startTemporaryUsageMutation.mutate()}
                  >
                    {startTemporaryUsageMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileCog className="mr-2 h-4 w-4" />
                    )}
                    {t("usage.actions.start")}
                  </Button>

                  <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{t("usage.active.title")}</h3>
                      <Badge className="border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100">
                        {activeTemporaryUsages.length}
                      </Badge>
                    </div>

                    {activeTemporaryUsages.length > 0 ? (
                      <div className="space-y-2">
                        {activeTemporaryUsages.map((usage) => (
                          <div
                            key={usage.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-white/90 p-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-foreground">{usage.temporaryLocationName}</p>
                              <p className="text-xs text-muted-foreground">
                                {usage.configurationName} · {usage.loggerSerial}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("usage.active.startedAt", {
                                  date: formatDateTime(usage.startedAt, locale),
                                })}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              className={vigilogBlueActionButtonClass}
                              disabled={stopTemporaryUsageMutation.isPending}
                              onClick={() => stopTemporaryUsageMutation.mutate(usage)}
                            >
                              {stopTemporaryUsageMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Circle className="mr-2 h-4 w-4" />
                              )}
                              {t("usage.actions.stop")}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("usage.active.empty")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configurations" className="mt-6 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t("config.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("config.description")}</p>
                </div>
                {canManageConfigurations ? (
                  <Button
                    className={vigilogBluePrimaryButtonClass}
                    onClick={() => {
                      setEditingConfiguration(null)
                      setConfigurationDialogOpen(true)
                    }}
                  >
                    {t("config.actions.create")}
                  </Button>
                ) : null}
              </div>

              {!canManageConfigurations ? (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>{t("config.readOnlyTitle")}</AlertTitle>
                  <AlertDescription>{t("config.readOnlyDescription")}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-2">
                {configurations.map((configuration) => (
                  <Card key={configuration.id} className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                    <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{configuration.name}</CardTitle>
                        <CardDescription>
                          {configuration.description || t("common.noDescription")}
                        </CardDescription>
                      </div>
                      <Badge variant={configuration.active ? "default" : "secondary"}>
                        {configuration.active ? t("config.states.active") : t("config.states.inactive")}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("config.fields.target")}
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {formatNumber(configuration.target)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("config.fields.alarmDelayMinutes")}
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {configuration.alarmDelayMinutes}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="font-medium text-foreground">{t("config.fields.lowLimitActive")}</p>
                          <p className="text-muted-foreground">
                            {configuration.lowLimitActive ? formatNumber(configuration.lowLimit) : t("common.disabled")}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t("config.fields.highLimitActive")}</p>
                          <p className="text-muted-foreground">
                            {configuration.highLimitActive ? formatNumber(configuration.highLimit) : t("common.disabled")}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t("config.fields.frequencyMinutes")}</p>
                          <p className="text-muted-foreground">{configuration.frequencyMinutes}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t("common.updatedAt")}</p>
                          <p className="text-muted-foreground">
                            {formatDateTime(configuration.updatedAt ?? configuration.createdAt, locale)}
                          </p>
                        </div>
                      </div>

                      {canManageConfigurations ? (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className={vigilogBlueActionButtonClass}
                            onClick={() => {
                              setEditingConfiguration(configuration)
                              setConfigurationDialogOpen(true)
                            }}
                          >
                            {t("config.actions.edit")}
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="loggers" className="mt-6 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t("loggers.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("loggers.description")}</p>
                </div>
                {canManageConfigurations ? (
                  <Button
                    className={vigilogBluePrimaryButtonClass}
                    onClick={() => {
                      setEditingLogger(null)
                      setLoggerDialogDefaults(null)
                      setLoggerDialogOpen(true)
                    }}
                  >
                    {t("loggers.actions.create")}
                  </Button>
                ) : null}
              </div>

              {detectedLogger?.serial && !detectedLogger.registeredLogger ? (
                <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("departure.loggerUnknown.title")}</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>
                      {t("departure.loggerUnknown.description", {
                        serial: detectedLogger.serial,
                      })}
                    </p>
                    {canManageConfigurations ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={vigilogActionButtonSecondaryShadowClass}
                        onClick={() => {
                          setEditingLogger(null)
                          setLoggerDialogDefaults({
                            serial: detectedLogger.serial ?? "",
                            model: detectedLogger.productId ?? "",
                          })
                          setLoggerDialogOpen(true)
                        }}
                      >
                        {t("departure.loggerUnknown.register")}
                      </Button>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-2">
                {loggers.map((logger) => (
                  <Card key={logger.id} className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                    <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {logger.label || logger.serial}
                        </CardTitle>
                        <CardDescription>
                          {[logger.model, logger.serial].filter(Boolean).join(" - ") || t("common.noDescription")}
                        </CardDescription>
                      </div>
                      <Badge variant={logger.active ? "default" : "secondary"}>
                        {logger.active ? t("loggers.states.active") : t("loggers.states.inactive")}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("loggers.fields.calibrationDate")}
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {formatDate(logger.calibrationDate, locale)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {t("loggers.fields.accuracyError")}
                          </p>
                          <p className="mt-2 text-base font-semibold text-foreground">
                            {formatNumber(logger.accuracyError)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="font-medium text-foreground">{t("loggers.fields.validityDate")}</p>
                          <p className="text-muted-foreground">
                            {formatDate(logger.calibrationValidityDate, locale)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t("loggers.fields.validityDays")}</p>
                          <p className="text-muted-foreground">
                            {logger.calibrationValidityDays ?? "-"}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground">
                        {logger.comment || t("common.noDescription")}
                      </p>

                      {canManageConfigurations ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            className={vigilogBlueActionButtonClass}
                            onClick={() => {
                              setEditingLogger(logger)
                              setLoggerDialogDefaults(null)
                              setLoggerDialogOpen(true)
                            }}
                          >
                            {t("loggers.actions.edit")}
                          </Button>
                          <Button
                            variant="outline"
                            className={vigilogBlueActionButtonClass}
                            onClick={() => {
                              setEditingLogger(logger)
                              setLoggerDialogDefaults({
                                serial: logger.serial,
                                model: logger.model ?? "",
                                label: logger.label ?? "",
                              })
                              setLoggerDialogOpen(true)
                            }}
                          >
                            {t("loggers.actions.saveCalibration")}
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {loggers.length === 0 ? (
                <Alert className="border-rose-200 bg-rose-50 text-rose-950">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("loggers.emptyTitle")}</AlertTitle>
                  <AlertDescription>{t("loggers.emptyDescription")}</AlertDescription>
                </Alert>
              ) : null}
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t("history.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("history.description")}</p>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("history.filters.search")}</Label>
                    <Input
                      value={historySearch}
                      onChange={(event) => setHistorySearch(event.target.value)}
                      placeholder={t("history.placeholders.search")}
                      className="h-11 w-full min-w-0 border-border/60 bg-white shadow-sm dark:bg-popover/95 lg:min-w-90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("history.filters.status")}</Label>
                    <Combobox
                      value={historyStatus}
                      onValueChange={setHistoryStatus}
                      placeholder={t("history.status.all")}
                      searchPlaceholder={t("history.placeholders.statusSearch")}
                      emptyMessage={t("history.placeholders.statusEmpty")}
                      buttonClassName={vigilogComboboxButtonClass}
                      className={vigilogComboboxPopoverClass}
                      options={[
                        { value: "ALL", label: t("history.status.all") },
                        { value: "EN_ATTENTE_RECEPTION", label: t("history.status.pendingReception") },
                        { value: "RECUE", label: t("history.status.received") },
                        { value: "ANALYSEE", label: t("history.status.analysed") },
                        { value: "ACQUITTEE", label: t("history.status.acknowledged") },
                        { value: "ANNULEE", label: t("history.status.cancelled") },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <Card className="border-border/60 bg-white/95 dark:bg-card/95 shadow-sm">
                <CardContent className="pt-6">
                  <TanStackTable
                    columns={historyColumns}
                    data={filteredHistory}
                    showSearch={false}
                    enableExport={false}
                    enablePrint={false}
                    emptyMessage={t("history.empty")}
                    pageSize={200}
                    showPagination={filteredHistory.length > 8}
                    maxHeight="36rem"
                    containerClassName="border-border/60 bg-white dark:bg-card/95"
                    headerClassName="!bg-sidebar !text-sidebar-foreground"
                    headerCellClassName="!bg-sidebar !text-sidebar-foreground !border-r !border-white/25 hover:!bg-sidebar-accent/80"
                    tableClassName="border-separate border-spacing-0 bg-transparent [&_thead_th]:!border-r [&_thead_th]:!border-white/25 [&_thead_th:last-child]:!border-r-0 [&_tbody_tr]:transition-colors [&_tbody_tr]:duration-150"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <VigilogConfigurationDialog
        open={configurationDialogOpen}
        configuration={editingConfiguration}
        pending={createConfigurationMutation.isPending || updateConfigurationMutation.isPending}
        onOpenChange={(open) => {
          setConfigurationDialogOpen(open)
          if (!open) {
            setEditingConfiguration(null)
          }
        }}
        onSubmit={(payload) => {
          if (editingConfiguration) {
            updateConfigurationMutation.mutate({
              id: editingConfiguration.id,
              payload,
            })
            return
          }
          createConfigurationMutation.mutate(payload)
        }}
      />

      <Dialog
        open={departureDialogState.mode !== "closed"}
        onOpenChange={(open) => {
          if (prepareLoggerMutation.isPending) return
          if (!open) setDepartureDialogState({ mode: "closed" })
        }}
      >
        <DialogContent className="max-w-lg border-border/60 bg-white shadow-sm dark:bg-popover dark:text-popover-foreground">
          <DialogHeader>
            <DialogTitle>{t("departurePreparation.title")}</DialogTitle>
            <DialogDescription>
              {t("departurePreparation.runningDescription")}
            </DialogDescription>
          </DialogHeader>

          {departureRunState ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-200/80 bg-sky-100/45 p-4 text-sm text-sky-950 shadow-[0_8px_24px_rgba(14,165,233,0.08)]">
                {t("departurePreparation.manualHint")}
              </div>
              {[
                t("departurePreparation.steps.resetMeasures"),
                t("departurePreparation.steps.applyConfiguration"),
                t("departurePreparation.steps.manualStart"),
              ].map((label, index) => {
                const stepNumber = index + 1
                const isDone =
                  departureRunState.mode === "success" ||
                  (departureRunState.mode === "running" && departureRunState.currentStep > stepNumber)
                const isCurrent =
                  departureRunState.mode === "running" && departureRunState.currentStep === stepNumber
                const isError =
                  departureRunState.mode === "error" && departureRunState.currentStep === stepNumber

                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      isError
                        ? "border-rose-200 bg-rose-50 text-rose-950"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                          : isCurrent
                            ? "border-sky-200 bg-sky-50 text-sky-950"
                            : "border-border/60 bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>{label}</span>
                  </div>
                )
              })}

              {departureRunState.mode === "success" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <p className="font-medium">
                    {t("departurePreparation.success", { serial: departureRunState.reference ?? "-" })}
                  </p>
                  <p className="mt-1 text-xs">{t("departurePreparation.manualStartDone")}</p>
                </div>
              ) : null}

              {departureRunState.mode === "error" ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                  {departureRunState.error || t("feedback.departureError.description")}
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            {departureDialogState.mode === "running" ? null : (
              <Button onClick={() => setDepartureDialogState({ mode: "closed" })}>
                {t("departurePreparation.actions.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={receiveDialogState.mode !== "closed"}
        onOpenChange={(open) => {
          if (receiveMutation.isPending) return
          if (!open) setReceiveDialogState({ mode: "closed" })
        }}
      >
        <DialogContent className="max-w-lg border-border/60 bg-white shadow-sm dark:bg-popover dark:text-popover-foreground">
          <DialogHeader>
            <DialogTitle>{t("receivePreparation.title")}</DialogTitle>
            <DialogDescription>{t("receivePreparation.runningDescription")}</DialogDescription>
          </DialogHeader>

          {receiveRunState ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-200/80 bg-sky-100/45 p-4 text-sm text-sky-950 shadow-[0_8px_24px_rgba(14,165,233,0.08)]">
                {t("receivePreparation.description")}
              </div>
              {[
                t("receivePreparation.steps.readStatus"),
                t("receivePreparation.steps.extractData"),
                t("receivePreparation.steps.prepareAnalysis"),
                t("receivePreparation.steps.clearData"),
              ].map((label, index) => {
                const stepNumber = index + 1
                const isDone =
                  receiveRunState.mode === "running" && receiveRunState.currentStep > stepNumber
                const isCurrent =
                  receiveRunState.mode === "running" && receiveRunState.currentStep === stepNumber
                const isError =
                  receiveRunState.mode === "error" && receiveRunState.currentStep === stepNumber

                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      isError
                        ? "border-rose-200 bg-rose-50 text-rose-950"
                        : isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                          : isCurrent
                            ? "border-sky-200 bg-sky-50 text-sky-950"
                            : "border-border/60 bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>{label}</span>
                  </div>
                )
              })}

              {receiveRunState.mode === "error" ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                  {receiveRunState.error || t("feedback.receiveError.description")}
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            {receiveDialogState.mode === "running" ? null : (
              <Button onClick={() => setReceiveDialogState({ mode: "closed" })}>
                {t("receivePreparation.actions.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VigilogLoggerDialog
        open={loggerDialogOpen}
        logger={editingLogger}
        defaults={loggerDialogDefaults}
        pending={createLoggerMutation.isPending || updateLoggerMutation.isPending}
        onOpenChange={(open) => {
          setLoggerDialogOpen(open)
          if (!open) {
            setEditingLogger(null)
            setLoggerDialogDefaults(null)
          }
        }}
        onSubmit={(payload) => {
          if (editingLogger) {
            updateLoggerMutation.mutate({
              id: editingLogger.id,
              payload,
            })
            return
          }
          createLoggerMutation.mutate(payload)
        }}
      />

      <Dialog
        open={acknowledgeDialogTournee != null}
        onOpenChange={(open) => {
          if (!open && !acknowledgeMutation.isPending) {
            setAcknowledgeDialogTournee(null)
            setAcknowledgeComment("")
          }
        }}
      >
        <DialogContent className="max-w-xl border-border/60 bg-white shadow-sm dark:bg-popover dark:text-popover-foreground">
          <DialogHeader>
            <DialogTitle>{t("history.actions.acknowledge")}</DialogTitle>
            <DialogDescription>
              {acknowledgeDialogTournee
                ? `${acknowledgeDialogTournee.reference} - ${acknowledgeDialogTournee.loggerSerial}`
                : t("feedback.ackError.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="vigilog-acknowledge-comment">{t("detail.ackComment")}</Label>
            <Textarea
              id="vigilog-acknowledge-comment"
              value={acknowledgeComment}
              onChange={(event) => setAcknowledgeComment(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={t("detail.ackComment")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={acknowledgeMutation.isPending}
              onClick={() => {
                setAcknowledgeDialogTournee(null)
                setAcknowledgeComment("")
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className={vigilogAmberButtonClass}
              disabled={acknowledgeMutation.isPending || !acknowledgeDialogTournee}
              onClick={() => {
                if (!acknowledgeDialogTournee) return
                acknowledgeMutation.mutate({
                  tourneeId: acknowledgeDialogTournee.id,
                  comment: acknowledgeComment.trim() || null,
                })
              }}
            >
              {t("history.actions.acknowledge")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelDialogTournee != null}
        onOpenChange={(open) => {
          if (!open && !cancelMutation.isPending) {
            setCancelDialogTournee(null)
          }
        }}
      >
        <DialogContent className="max-w-xl border-border/60 bg-white shadow-sm dark:bg-popover dark:text-popover-foreground">
          <DialogHeader>
            <DialogTitle>{t("cancelTour.title")}</DialogTitle>
            <DialogDescription>
              {cancelDialogTournee
                ? t("cancelTour.description", {
                    reference: cancelDialogTournee.reference,
                    serial: cancelDialogTournee.loggerSerial,
                  })
                : t("cancelTour.descriptionFallback")}
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-200 bg-amber-50 text-amber-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("cancelTour.warningTitle")}</AlertTitle>
            <AlertDescription>{t("cancelTour.warningDescription")}</AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
              onClick={() => setCancelDialogTournee(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending || !cancelDialogTournee}
              onClick={() => {
                if (!cancelDialogTournee) return
                cancelMutation.mutate(cancelDialogTournee.id)
              }}
            >
              {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t("cancelTour.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VigilogTourneeDetailDialog
        open={detailDialogOpen}
        pending={detailQuery.isLoading || detailQuery.isFetching}
        detail={detailQuery.data ?? null}
        onOpenChange={(open) => {
          setDetailDialogOpen(open)
          if (!open) {
            setDetailTourneeId(null)
          }
        }}
      />
    </div>
  )
}
