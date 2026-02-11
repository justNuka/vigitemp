import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SharedFileUpload, { type UploadItem } from "@/components/file-upload-shared";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Check, FileText, ListTodo, LoaderCircleIcon, WandSparkles } from "lucide-react";

type ValidationStatus = "ok" | "fixed" | "error";

type ValidationResult = {
  file: File;
  status: ValidationStatus;
  errors: string[];
  encoding: string;
  xmlText: string;
};

export type SharedImportStepperProps<TImportResult> = {
  stepperNamespace: "sensorAdjustmentStepper" | "sensorCalibrationStepper";
  uploadNamespace: "sensorAdjustmentUpload" | "sensorCalibrationUpload";
  previewEndpoint: string;
  validateRootTag: (rootTag: string) => boolean;
  invalidRootError?: string;
  onUploadResult?: (result: TImportResult) => void;
  onFinish?: () => void;
};

export default function SharedImportStepper<TImportResult>({
  stepperNamespace,
  uploadNamespace,
  previewEndpoint,
  validateRootTag,
  invalidRootError,
  onUploadResult,
  onFinish,
}: SharedImportStepperProps<TImportResult>) {
  const t = useTranslations(stepperNamespace);
  const [currentStep, setCurrentStep] = useState(1);
  const directionRef = useRef(0);
  const prevStepRef = useRef(currentStep);
  const prefersReducedMotion = useReducedMotion();
  const [canProceed, setCanProceed] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [processState, setProcessState] = useState<"idle" | "running" | "done">("idle");
  const [processError, setProcessError] = useState<string | null>(null);
  const [processStats, setProcessStats] = useState({ processed: 0, success: 0, failed: 0 });

  const buildNameCounts = useCallback((items: UploadItem[]) => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
    }
    return counts;
  }, []);

  const filterFilesByUploadNames = useCallback(
    (files: File[], counts: Map<string, number>) => {
      const remaining = new Map(counts);
      const next: File[] = [];
      for (const file of files) {
        const count = remaining.get(file.name) ?? 0;
        if (count > 0) {
          next.push(file);
          remaining.set(file.name, count - 1);
        }
      }
      return next;
    },
    [],
  );

  const filterValidationByUploadNames = useCallback(
    (results: ValidationResult[], counts: Map<string, number>) => {
      const remaining = new Map(counts);
      const next: ValidationResult[] = [];
      for (const result of results) {
        const count = remaining.get(result.file.name) ?? 0;
        if (count > 0) {
          next.push(result);
          remaining.set(result.file.name, count - 1);
        }
      }
      return next;
    },
    [],
  );


  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const decodeXmlContent = (buffer: ArrayBuffer) => {
    const utf8Decoder = new TextDecoder("utf-8", { fatal: false });
    let utf8Text = utf8Decoder.decode(buffer);
    let corrected = false;

    const declaredEncodingMatch = utf8Text.match(/encoding="([^"]+)"/i);
    const declaredEncoding = declaredEncodingMatch?.[1] ?? null;

    const replacementChar = String.fromCharCode(0xfffd);
    const mojibakeE = String.fromCharCode(0x00ef, 0x00bf, 0x00bd);
    const mojibakeDeg = String.fromCharCode(0x00c2, 0x00b0);
    const uppercaseE = String.fromCharCode(0x00c9);
    const degree = String.fromCharCode(0x00b0);

    const fixTagContent = (tagName: string, fixer: (value: string) => string) => {
      const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "gi");
      utf8Text = utf8Text.replace(pattern, (_match, content) => {
        const next = fixer(content);
        if (next !== content) corrected = true;
        return `<${tagName}>${next}</${tagName}>`;
      });
    };

    fixTagContent("OPERATEUR", (value) => value.replaceAll(replacementChar, uppercaseE).replaceAll(mojibakeE, uppercaseE));
    fixTagContent("UNITE", (value) => value.replaceAll(replacementChar, degree).replaceAll(mojibakeDeg, degree));

    return { text: utf8Text, encoding: declaredEncoding ?? "utf-8", corrected };
  };

  const validateXml = (xmlText: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    const hasError = doc.getElementsByTagName("parsererror").length > 0;
    if (hasError) return { ok: false, errors: [t("validation.errors.invalid_xml")] };

    const rawRootTag = doc.documentElement?.tagName?.toUpperCase() ?? "";
    const rootTag = rawRootTag.includes(":") ? (rawRootTag.split(":").pop() ?? "") : rawRootTag;
    if (!validateRootTag(rootTag)) {
      return { ok: false, errors: [invalidRootError ?? t("validation.errors.invalid_root")] };
    }

    return { ok: true, errors: [] };
  };

  const runValidation = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setValidationResults([]);
      return;
    }

    const results: ValidationResult[] = [];
    for (const file of selectedFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const decoded = decodeXmlContent(buffer);
        const validation = validateXml(decoded.text);
        const status: ValidationStatus = validation.ok ? (decoded.corrected ? "fixed" : "ok") : "error";
        results.push({
          file,
          status,
          errors: validation.errors,
          encoding: decoded.encoding,
          xmlText: decoded.text,
        });
      } catch {
        results.push({
          file,
          status: "error",
          errors: [t("validation.errors.unreadable")],
          encoding: "unknown",
          xmlText: "",
        });
      }
    }
    setValidationResults(results);
  }, [selectedFiles, t]);

  useEffect(() => {
    directionRef.current = currentStep > prevStepRef.current ? 1 : -1;
    prevStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    const counts = buildNameCounts(uploads);

    setSelectedFiles((prev) => {
      const next = filterFilesByUploadNames(prev, counts);
      return next.length === prev.length ? prev : next;
    });

    setValidationResults((prev) => {
      const next = filterValidationByUploadNames(prev, counts);
      return next.length === prev.length ? prev : next;
    });
  }, [buildNameCounts, filterFilesByUploadNames, filterValidationByUploadNames, uploads]);


  useEffect(() => {
    if (currentStep === 2) {
      void runValidation();
    }
    if (currentStep === 3) {
      setProcessState("idle");
      setProcessError(null);
      setProcessStats({ processed: 0, success: 0, failed: 0 });
    }
  }, [currentStep, runValidation]);

  const nextDisabledReason = currentStep === 1 && !canProceed ? t("actions.next_disabled_no_file") : undefined;

  const summary = useMemo(() => {
    const total = validationResults.length;
    const ok = validationResults.filter((result) => result.status === "ok").length;
    const fixed = validationResults.filter((result) => result.status === "fixed").length;
    const error = validationResults.filter((result) => result.status === "error").length;
    return { total, ok, fixed, error };
  }, [validationResults]);

  const validResults = useMemo(() => validationResults.filter((result) => result.status !== "error"), [validationResults]);

  const handleProcess = useCallback(async () => {
    if (validResults.length === 0) return;
    setProcessState("running");
    setProcessError(null);
    setProcessStats({ processed: 0, success: 0, failed: 0 });

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const result of validResults) {
      processed += 1;
      setProcessStats({ processed, success, failed });
      try {
        const file = new File([result.xmlText], result.file.name, {
          type: result.file.type || "application/xml",
        });
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(previewEndpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          failed += 1;
          setProcessStats({ processed, success, failed });
          continue;
        }

        const payload = await response.json();
        if (payload?.data) {
          onUploadResult?.(payload.data as TImportResult);
          success += 1;
          setProcessStats({ processed, success, failed });
        } else {
          failed += 1;
          setProcessStats({ processed, success, failed });
        }
      } catch {
        failed += 1;
        setProcessStats({ processed, success, failed });
      }
    }

    if (failed > 0) {
      setProcessError(t("create.process_errors", { count: failed }));
    }
    setProcessState("done");
  }, [onUploadResult, previewEndpoint, t, validResults]);

  const steps = useMemo(
    () => [
      { title: t("steps.upload"), icon: FileText },
      { title: t("steps.review"), icon: ListTodo },
      { title: t("steps.create"), icon: WandSparkles },
    ],
    [t],
  );

  return (
    <Stepper
      value={currentStep}
      onValueChange={setCurrentStep}
      indicators={{ loading: <LoaderCircleIcon className="size-4 animate-spin" /> }}
      className="space-y-6 flex flex-col h-full min-h-0 overflow-hidden"
    >
      <StepperNav className="gap-6 mb-6 justify-center w-full">
        {steps.map((step, index) => (
          <StepperItem key={step.title} step={index + 1} className="relative flex-1 flex-col items-center">
            <StepperTrigger className="flex flex-col items-center justify-center gap-2.5 grow text-center" asChild>
              <StepperIndicator className="size-9 border-2 flex items-center justify-center transition-colors duration-300 data-[state=completed]:bg-emerald-500 data-[state=completed]:text-emerald-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground">
                <span className="relative inline-flex size-4 items-center justify-center">
                  <Check className="absolute left-1/2 top-2.5 size-4 -translate-x-1/2 -translate-y-[55%] opacity-0 scale-50 transition-all duration-300 group-data-[state=completed]/step:opacity-100 group-data-[state=completed]/step:scale-100 text-emerald-50" />
                  <step.icon className="absolute left-1/2 top-2.5 size-4 -translate-x-1/2 -translate-y-[55%] opacity-100 scale-100 transition-all duration-300 group-data-[state=completed]/step:opacity-0 group-data-[state=completed]/step:scale-75 group-data-[state=active]/step:text-primary-foreground group-data-[state=inactive]/step:text-muted-foreground" />
                </span>
              </StepperIndicator>
              <div className="flex flex-col items-center gap-1">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">{t("step_label", { step: index + 1 })}</div>
                <StepperTitle className="text-center text-base font-semibold group-data-[state=inactive]/step:text-muted-foreground">{step.title}</StepperTitle>
                <div>
                  <Badge variant="primary" className="hidden group-data-[state=active]/step:inline-flex">{t("status.in_progress")}</Badge>
                  <Badge variant="success" size="sm" className="hidden group-data-[state=completed]/step:inline-flex">{t("status.completed")}</Badge>
                  <Badge variant="secondary" size="sm" className="hidden group-data-[state=inactive]/step:inline-flex text-muted-foreground">{t("status.pending")}</Badge>
                </div>
              </div>
            </StepperTrigger>

            {steps.length > index + 1 && (
              <StepperSeparator className="absolute top-4.5 left-[calc(55%+1.125rem)] w-[calc(100%-2.25rem)] h-0.5 bg-muted-foreground/30 group-data-[state=completed]/step:bg-emerald-500" />
            )}
          </StepperItem>
        ))}
      </StepperNav>

      <StepperPanel className="text-sm flex-1 min-h-0 overflow-y-auto pr-2 pb-10 pt-2">
        <LazyMotion features={domAnimation}>
          <AnimatePresence mode="wait">
            <m.div
              data-step-content
              key={currentStep}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: directionRef.current * 20 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: directionRef.current * -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full min-h-full"
            >
              {currentStep === 1 && (
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
              )}

              {currentStep === 2 && (
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
                            {result.status === "ok" && <span className="text-emerald-600">{t("validation.status.ok")}</span>}
                            {result.status === "fixed" && <span className="text-amber-600">{t("validation.status.fixed")}</span>}
                            {result.status === "error" && <span className="text-destructive">{t("validation.status.error")}</span>}
                          </div>
                          {result.errors.length > 0 && (
                            <ul className="text-xs text-muted-foreground list-disc pl-4">
                              {result.errors.map((err) => (
                                <li key={err}>{err}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
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

                  {processState === "running" && (
                    <div className="text-sm text-muted-foreground">{t("create.processing", { processed: processStats.processed, total: summary.total })}</div>
                  )}

                  {processState === "done" && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-700">
                      {t("create.process_done", { count: processStats.success })}
                      <div className="mt-1 text-emerald-700/80">{t("create.process_result", { success: processStats.success, failed: processStats.failed })}</div>
                    </div>
                  )}

                  {processError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{processError}</div>
                  )}
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </StepperPanel>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-2.5 border-t pt-4">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
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
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    if (currentStep === 3) {
                      if (processState === "done") {
                        onFinish?.();
                      } else {
                        void handleProcess();
                      }
                      return;
                    }
                    setCurrentStep((prev) => prev + 1);
                  }}
                  disabled={
                    (currentStep === 1 && !canProceed)
                    || (currentStep === 3 && processState === "running")
                    || (currentStep === 3 && validResults.length === 0)
                  }
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
  );
}





