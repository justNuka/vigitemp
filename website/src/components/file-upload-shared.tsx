"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadStatusSection } from "@/components/file-upload-shared/upload-status-section";
import { Upload, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

export type UploadStatus = "uploading" | "completed" | "error";

export interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface SharedFileUploadProps {
  translationNamespace: "sensorAdjustmentUpload" | "sensorCalibrationUpload";
  uploadUrl?: string;
  accept?: string;
  multiple?: boolean;
  mode?: "upload" | "local";
  uploads?: UploadItem[];
  onUploadsChange?: (items: UploadItem[] | ((prev: UploadItem[]) => UploadItem[])) => void;
  onAllCompleteChange?: (complete: boolean) => void;
  onUploadSuccess?: (payload: unknown, file: File) => void;
  onFilesSelected?: (files: File[]) => void;
}

const hasFilesInDragEvent = (event: DragEvent | React.DragEvent) => {
  const types = event.dataTransfer?.types;
  if (!types) return false;
  return Array.from(types).includes("Files");
};

const toFileArray = (files: FileList | File[] | null | undefined): File[] => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Array.from(files);
};

export default function SharedFileUpload({
  translationNamespace,
  uploadUrl,
  accept = ".xml,application/xml,text/xml",
  multiple = true,
  mode = "upload",
  uploads: controlledUploads,
  onUploadsChange,
  onAllCompleteChange,
  onUploadSuccess,
  onFilesSelected,
}: SharedFileUploadProps) {
  const t = useTranslations(translationNamespace);
  const [internalUploads, setInternalUploads] = useState<UploadItem[]>([]);
  const [isGlobalDragActive, setIsGlobalDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const ignoreNextWindowDropRef = useRef(false);

  const uploads = controlledUploads ?? internalUploads;

  const setUploadsState = (next: UploadItem[] | ((prev: UploadItem[]) => UploadItem[])) => {
    if (typeof next === "function") {
      if (onUploadsChange) {
        onUploadsChange(next);
        return;
      }
      const updated = next(uploads);
      setInternalUploads(updated);
      return;
    }

    if (onUploadsChange) {
      onUploadsChange(next);
    } else {
      setInternalUploads(next);
    }
  };

  const filePickerRef = useRef<HTMLInputElement>(null);

  const activeUploads = useMemo(() => uploads.filter((file) => file.status === "uploading"), [uploads]);
  const completedUploads = useMemo(() => uploads.filter((file) => file.status === "completed"), [uploads]);
  const erroredUploads = useMemo(() => uploads.filter((file) => file.status === "error"), [uploads]);

  useEffect(() => {
    if (!onAllCompleteChange) return;
    const allDone = uploads.length > 0 && uploads.every((file) => file.status === "completed");
    onAllCompleteChange(allDone);
  }, [onAllCompleteChange, uploads]);

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const isXmlFile = (file: File) => {
    const name = file.name.toLowerCase();
    const hasXmlExtension = name.endsWith(".xml");
    const isXmlType = file.type === "application/xml" || file.type === "text/xml" || file.type === "";
    return hasXmlExtension || isXmlType;
  };

  const addUpload = (file: File) => {
    const id = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
    setUploadsState((prev) => [
      ...prev,
      {
        id,
        name: file.name,
        progress: 0,
        status: "uploading",
      },
    ]);
    return id;
  };

  const updateUpload = (id: string, updates: Partial<UploadItem>) => {
    setUploadsState((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)));
  };

  const uploadFile = (file: File, id: string) =>
    new Promise<void>((resolve, reject) => {
      if (!uploadUrl) {
        updateUpload(id, { status: "error", error: t("errors.upload_failed") });
        reject(new Error(t("errors.upload_failed")));
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateUpload(id, { progress });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateUpload(id, { progress: 100, status: "completed" });
          if (onUploadSuccess) {
            try {
              const payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
              onUploadSuccess(payload, file);
            } catch {
              onUploadSuccess(null, file);
            }
          }
          resolve();
          return;
        }

        const message = xhr.responseText || t("errors.upload_failed");
        updateUpload(id, { status: "error", error: message });
        reject(new Error(message));
      };
      xhr.onerror = () => {
        const message = t("errors.upload_failed");
        updateUpload(id, { status: "error", error: message });
        reject(new Error(message));
      };
      xhr.send(formData);
    });

  const handleFiles = useCallback(async (rawFiles: FileList | File[] | null | undefined) => {
    const files = toFileArray(rawFiles);
    if (files.length === 0) return;

    const accepted: File[] = [];
    const rejected: File[] = [];

    files.forEach((file) => {
      if (isXmlFile(file)) {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    });

    rejected.forEach((file) => {
      const id = addUpload(file);
      updateUpload(id, {
        status: "error",
        progress: 0,
        error: t("errors.invalid_type"),
      });
    });

    if (accepted.length > 0 && onFilesSelected) {
      onFilesSelected(accepted);
    }

    if (mode === "local") {
      for (const file of accepted) {
        const id = addUpload(file);
        updateUpload(id, { progress: 0, status: "uploading" });
        setTimeout(() => {
          updateUpload(id, { progress: 100, status: "completed" });
        }, 200);
      }
      return;
    }

    for (const file of accepted) {
      const id = addUpload(file);
      try {
        await uploadFile(file, id);
      } catch {
        // error already handled
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onFilesSelected, t, uploadUrl]);

  useEffect(() => {
    const onWindowDragEnter = (event: DragEvent) => {
      if (!hasFilesInDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsGlobalDragActive(true);
    };

    const onWindowDragOver = (event: DragEvent) => {
      if (!hasFilesInDragEvent(event)) return;
      event.preventDefault();
      if (!isGlobalDragActive) setIsGlobalDragActive(true);
    };

    const onWindowDragLeave = (event: DragEvent) => {
      if (!hasFilesInDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsGlobalDragActive(false);
      }
    };

    const onWindowDrop = (event: DragEvent) => {
      if (!hasFilesInDragEvent(event)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsGlobalDragActive(false);
      if (ignoreNextWindowDropRef.current) {
        ignoreNextWindowDropRef.current = false;
        return;
      }
      void handleFiles(event.dataTransfer?.files ?? null);
    };

    window.addEventListener("dragenter", onWindowDragEnter);
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("dragleave", onWindowDragLeave);
    window.addEventListener("drop", onWindowDrop);

    return () => {
      window.removeEventListener("dragenter", onWindowDragEnter);
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("dragleave", onWindowDragLeave);
      window.removeEventListener("drop", onWindowDrop);
    };
  }, [handleFiles, isGlobalDragActive]);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
    event.target.value = "";
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsGlobalDragActive(false);
    ignoreNextWindowDropRef.current = true;
    void handleFiles(event.dataTransfer.files);
  };

  const removeUploadById = (id: string) => {
    setUploadsState((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <>
      {isGlobalDragActive ? (
        <div className="fixed inset-0 z-[80] pointer-events-none bg-black/10">
          <div className="absolute inset-6 rounded-xl border-2 border-dashed border-primary/90 bg-primary/10" />
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-y-6 max-h-[70vh]">
        <Card
          className={cn(
            "group flex w-full flex-col items-center justify-center gap-4 py-8 border-dashed text-sm cursor-pointer transition-colors",
            "hover:bg-muted/50",
            isGlobalDragActive && "border-2 border-primary/80 bg-primary/5 ring-2 ring-primary/25",
          )}
          onDragOver={onDragOver}
          onDrop={onDropFiles}
          onClick={openFilePicker}
        >
          <div className="grid space-y-3">
            <div className="flex items-center gap-x-2 text-muted-foreground">
              <Upload className="size-5" />
              <div>{t("drop_browse_zone")}</div>
            </div>
          </div>
          <input
            ref={filePickerRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={onFileInputChange}
          />
          <span className="text-sm text-muted-foreground mt-2 block">{t("supported")}</span>
        </Card>

        {uploads.length > 0 && (
          <div className="flex flex-col gap-y-4 overflow-hidden">
            <UploadStatusSection
              title={t("sections.uploading")}
              icon={<Loader2 className={cn("size-4 mr-2", activeUploads.length > 0 ? "animate-spin" : "opacity-70")} />}
              items={activeUploads}
              emptyMessage={t("placeholders.uploading")}
              removeLabel={t("remove")}
              maxHeightClassName="max-h-60"
            />

            <UploadStatusSection
              title={t("sections.finished")}
              icon={<CheckCircle className="mr-2 size-4 text-primary" />}
              items={completedUploads}
              emptyMessage={t("placeholders.finished")}
              removeLabel={t("remove")}
              maxHeightClassName="max-h-60"
              onRemove={removeUploadById}
            />

            {erroredUploads.length > 0 ? (
              <UploadStatusSection
                title={t("sections.failed")}
                icon={<AlertTriangle className="mr-2 size-4 text-destructive" />}
                items={erroredUploads}
                emptyMessage={t("placeholders.failed")}
                removeLabel={t("remove")}
                maxHeightClassName="max-h-40 min-h-12"
                showProgress={false}
                showErrorLabel={t("errors.label")}
                onRemove={removeUploadById}
              />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}


