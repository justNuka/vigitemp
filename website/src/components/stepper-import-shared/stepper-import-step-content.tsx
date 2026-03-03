import SharedFileUpload, { type UploadItem } from "@/components/file-upload-shared"
import type { ValidationResult } from "./stepper-import-types"

export function StepperImportStepContent<TImportResult>({
  currentStep,
  uploadNamespace,
  uploads,
  setUploads,
  setCanProceed,
  handleFilesSelected,
  t,
  validationResults,
  summary,
  processState,
  processStats,
  processError,
}: {
  currentStep: number
  uploadNamespace: "sensorAdjustmentUpload" | "sensorCalibrationUpload"
  uploads: UploadItem[]
  setUploads: (items: UploadItem[] | ((prev: UploadItem[]) => UploadItem[])) => void
  setCanProceed: (complete: boolean) => void
  handleFilesSelected: (files: File[]) => void
  t: (key: string, values?: Record<string, string | number>) => string
  validationResults: ValidationResult[]
  summary: { total: number; ok: number; fixed: number; error: number }
  processState: "idle" | "running" | "done"
  processStats: { processed: number; success: number; failed: number }
  processError: string | null
}) {
  if (currentStep === 1) {
    return (
      <div className="flex items-center justify-center border-1.5 rounded-md p-6 w-full bg-slate-200/10">
        <SharedFileUpload
          translationNamespace={uploadNamespace}
          mode="local"
          uploads={uploads}
          onUploadsChange={setUploads}
          onAllCompleteChange={setCanProceed}
          onFilesSelected={handleFilesSelected}
        />
      </div>
    )
  }

  if (currentStep === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="text-sm text-muted-foreground">{t("validation.description")}</div>
        {validationResults.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("validation.empty")}</div>
        ) : (
          <div className="space-y-3">
            {validationResults.map((result) => (
              <div key={result.file.name} className="flex flex-col gap-1 rounded-lg border px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">{result.file.name}</div>
                  <div className="text-xs text-muted-foreground">{t("validation.encoding", { encoding: result.encoding })}</div>
                </div>
                <div className="text-sm">
                  {result.status === "ok" ? <span className="text-emerald-600">{t("validation.status.ok")}</span> : null}
                  {result.status === "fixed" ? <span className="text-amber-600">{t("validation.status.fixed")}</span> : null}
                  {result.status === "error" ? <span className="text-destructive">{t("validation.status.error")}</span> : null}
                </div>
                {result.errors.length > 0 ? (
                  <ul className="text-xs text-muted-foreground list-disc pl-4">
                    {result.errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="text-sm font-semibold">{t("create.summary_title")}</div>
        <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
          <div>{t("create.summary_total", { count: summary.total })}</div>
          <div>{t("create.summary_valid", { count: summary.ok + summary.fixed })}</div>
          <div>{t("create.summary_fixed", { count: summary.fixed })}</div>
          <div>{t("create.summary_error", { count: summary.error })}</div>
        </div>
      </div>

      {processState === "running" ? (
        <div className="text-sm text-muted-foreground">{t("create.processing", { processed: processStats.processed, total: summary.total })}</div>
      ) : null}

      {processState === "done" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-700">
          {t("create.process_done", { count: processStats.success })}
          <div className="mt-1 text-emerald-700/80">
            {t("create.process_result", { success: processStats.success, failed: processStats.failed })}
          </div>
        </div>
      ) : null}

      {processError ? <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{processError}</div> : null}
    </div>
  )
}
