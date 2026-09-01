import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { UploadItem } from "@/components/file-upload-shared"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { Check, FileText, ListTodo, LoaderCircleIcon, WandSparkles } from "lucide-react"

import { StepperImportStepContent } from "@/components/stepper-import-shared/stepper-import-step-content"
import { buildNameCounts, buildValidationResult, decodeXmlContent, filterFilesByUploadNames, filterValidationByUploadNames, validateXml } from "@/components/stepper-import-shared/stepper-import-helpers"
import type { SharedImportStepperProps, ValidationResult, ValidationStatus } from "@/components/stepper-import-shared/stepper-import-types"

export default function SharedImportStepper<TImportResult>({
  stepperNamespace,
  uploadNamespace,
  previewEndpoint,
  validateRootTag,
  invalidRootError,
  onUploadResult,
  onFinish,
  closeOnProcessSuccess = false,
}: SharedImportStepperProps<TImportResult>) {
  const t = useTranslations(stepperNamespace)
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const [canProceed, setCanProceed] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [processState, setProcessState] = useState<"idle" | "running" | "done">("idle")
  const [processError, setProcessError] = useState<string | null>(null)
  const [processStats, setProcessStats] = useState({ processed: 0, success: 0, failed: 0 })

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files])
  }, [])

  const handleStepChange = useCallback((nextStep: number) => {
    setCurrentStep((prev) => {
      setDirection(nextStep > prev ? 1 : -1)
      return nextStep
    })
  }, [])

  const runValidation = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setValidationResults([])
      return
    }

    const results: ValidationResult[] = []
    for (const file of selectedFiles) {
      try {
        const buffer = await file.arrayBuffer()
        const decoded = decodeXmlContent(buffer)
        const validation = validateXml(
          decoded.text,
          validateRootTag,
          invalidRootError,
          t("validation.errors.invalid_xml"),
          t("validation.errors.invalid_root"),
        )
        const status: ValidationStatus = validation.ok ? (decoded.corrected ? "fixed" : "ok") : "error"
        results.push(buildValidationResult(file, status, validation.errors, decoded.encoding, decoded.text))
      } catch {
        results.push(buildValidationResult(file, "error", [t("validation.errors.unreadable")], "unknown", ""))
      }
    }
    setValidationResults(results)
  }, [selectedFiles, validateRootTag, invalidRootError, t])

  useEffect(() => {
    const counts = buildNameCounts(uploads)
    const syncId = window.setTimeout(() => {
      setSelectedFiles((prev) => {
        const next = filterFilesByUploadNames(prev, counts)
        return next.length === prev.length ? prev : next
      })
      setValidationResults((prev) => {
        const next = filterValidationByUploadNames(prev, counts)
        return next.length === prev.length ? prev : next
      })
    }, 0)

    return () => {
      window.clearTimeout(syncId)
    }
  }, [uploads])

  useEffect(() => {
    const stepId = window.setTimeout(() => {
      if (currentStep === 2) {
        void runValidation()
      }
      if (currentStep === 3) {
        setProcessState("idle")
        setProcessError(null)
        setProcessStats({ processed: 0, success: 0, failed: 0 })
      }
    }, 0)

    return () => {
      window.clearTimeout(stepId)
    }
  }, [currentStep, runValidation])

  const nextDisabledReason = currentStep === 1 && !canProceed ? t("actions.next_disabled_no_file") : undefined

  const summary = useMemo(() => {
    const total = validationResults.length
    const ok = validationResults.filter((result) => result.status === "ok").length
    const fixed = validationResults.filter((result) => result.status === "fixed").length
    const error = validationResults.filter((result) => result.status === "error").length
    return { total, ok, fixed, error }
  }, [validationResults])

  const validResults = useMemo(() => validationResults.filter((result) => result.status !== "error"), [validationResults])

  const handleProcess = useCallback(async () => {
    if (validResults.length === 0) return
    setProcessState("running")
    setProcessError(null)
    setProcessStats({ processed: 0, success: 0, failed: 0 })

    let processed = 0
    let success = 0
    let failed = 0

    for (const result of validResults) {
      processed += 1
      setProcessStats({ processed, success, failed })
      try {
        const file = new File([result.xmlText], result.file.name, { type: result.file.type || "application/xml" })
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(previewEndpoint, { method: "POST", body: formData })
        if (!response.ok) {
          failed += 1
          setProcessStats({ processed, success, failed })
          continue
        }

        const payload = await response.json()
        if (payload?.data) {
          onUploadResult?.(payload.data as TImportResult)
          success += 1
        } else {
          failed += 1
        }
        setProcessStats({ processed, success, failed })
      } catch {
        failed += 1
        setProcessStats({ processed, success, failed })
      }
    }

    if (failed > 0) setProcessError(t("create.process_errors", { count: failed }))
    setProcessState("done")

    if (closeOnProcessSuccess && failed === 0) {
      window.setTimeout(() => {
        onFinish?.()
      }, 100)
    }
  }, [closeOnProcessSuccess, onFinish, onUploadResult, previewEndpoint, t, validResults])

  const steps = useMemo(
    () => [
      { title: t("steps.upload"), icon: FileText },
      { title: t("steps.review"), icon: ListTodo },
      { title: t("steps.create"), icon: WandSparkles },
    ],
    [t],
  )

  const stepCompletion = useMemo(() => ({
    1: currentStep > 1 || (currentStep === 1 && canProceed),
    2: currentStep > 2 || (currentStep === 2 && validationResults.length > 0 && summary.error === 0),
    3: processState === "done" && processStats.failed === 0,
  }), [canProceed, currentStep, processState, processStats.failed, summary.error, validationResults.length])

  return (
    <Stepper
      value={currentStep}
      onValueChange={handleStepChange}
      indicators={{ loading: <LoaderCircleIcon className="size-4 animate-spin" /> }}
      className="space-y-6 flex flex-col h-full min-h-0 overflow-hidden"
    >
      <StepperNav className="gap-6 mb-6 justify-center w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepCompletion[stepNumber as 1 | 2 | 3]
          const isActive = currentStep === stepNumber && !isCompleted
          const statusBadge = isCompleted ? "completed" : isActive ? "active" : "pending"

          return (
            <StepperItem key={step.title} step={stepNumber} className="relative flex-1 flex-col items-center">
              <StepperTrigger className="flex flex-col items-center justify-center gap-2.5 grow text-center" asChild>
                <StepperIndicator className={`size-9 border-2 flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'border-emerald-500 bg-emerald-500 text-emerald-50' : isActive ? 'border-primary bg-primary text-primary-foreground' : 'bg-transparent border-border text-muted-foreground'}`}>
                  <span className="relative inline-flex size-4 items-center justify-center">
                    {isCompleted ? (
                      <Check className="size-4 text-emerald-50" />
                    ) : (
                      <step.icon className={`size-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    )}
                  </span>
                </StepperIndicator>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">{t("step_label", { step: stepNumber })}</div>
                  <StepperTitle className="text-center text-base font-semibold text-foreground">{step.title}</StepperTitle>
                  <div>
                    {statusBadge === 'active' ? <Badge variant="primary">{t("status.in_progress")}</Badge> : null}
                    {statusBadge === 'completed' ? <Badge variant="success" size="sm">{t("status.completed")}</Badge> : null}
                    {statusBadge === 'pending' ? <Badge variant="secondary" size="sm" className="text-muted-foreground">{t("status.pending")}</Badge> : null}
                  </div>
                </div>
              </StepperTrigger>
              {steps.length > stepNumber ? <StepperSeparator className={`absolute top-4.5 left-[calc(55%+1.125rem)] w-[calc(100%-2.25rem)] h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} /> : null}
            </StepperItem>
          )
        })}
      </StepperNav>

      <StepperPanel className="text-sm flex-1 min-h-0 overflow-y-auto pr-2 pb-10 pt-2">
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <m.div
              data-step-content
              key={currentStep}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: direction * 20 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: direction * -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full min-h-full"
            >
              <StepperImportStepContent
                currentStep={currentStep}
                uploadNamespace={uploadNamespace}
                uploads={uploads}
                setUploads={setUploads}
                setCanProceed={setCanProceed}
                handleFilesSelected={handleFilesSelected}
                t={t}
                validationResults={validationResults}
                summary={summary}
                processState={processState}
                processStats={processStats}
                processError={processError}
                closeOnProcessSuccess={closeOnProcessSuccess}
              />
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </StepperPanel>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-2.5 border-t pt-4">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={() => handleStepChange(currentStep - 1)}>
            {t("actions.previous")}
          </Button>
        ) : (
          <span />
        )}

        <TooltipProvider>
          <Tooltip open={nextDisabledReason ? undefined : false}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (currentStep === 3) {
                      if (processState === "done") onFinish?.()
                      else void handleProcess()
                      return
                    }
                    handleStepChange(currentStep + 1)
                  }}
                  disabled={(currentStep === 1 && !canProceed) || (currentStep === 3 && processState === "running") || (currentStep === 3 && validResults.length === 0)}
                >
                  {currentStep === 3
                    ? processState === "done"
                      ? t("actions.finish")
                      : processState === "running"
                        ? t("actions.processing")
                        : t("actions.process")
                    : t("actions.next")}
                </Button>
              </span>
            </TooltipTrigger>
            {nextDisabledReason ? <TooltipContent>{nextDisabledReason}</TooltipContent> : null}
          </Tooltip>
        </TooltipProvider>
      </div>
    </Stepper>
  )
}
