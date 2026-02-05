"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, X, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

type UploadStatus = "uploading" | "completed" | "error";

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface FileUploadProps {
  uploadUrl: string;
  accept?: string;
  multiple?: boolean;
  onAllCompleteChange?: (complete: boolean) => void;
}

export default function FileUpload({
  uploadUrl,
  accept = ".xml,application/xml,text/xml",
  multiple = true,
  onAllCompleteChange,
}: FileUploadProps) {
  const t = useTranslations("probeAdjustmentUpload");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const activeUploads = useMemo(
    () => uploads.filter((file) => file.status === "uploading"),
    [uploads],
  );
  const completedUploads = useMemo(
    () => uploads.filter((file) => file.status === "completed"),
    [uploads],
  );
  const erroredUploads = useMemo(
    () => uploads.filter((file) => file.status === "error"),
    [uploads],
  );

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
    setUploads((prev) => [
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
    setUploads((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)));
  };

  const uploadFile = (file: File, id: string) =>
    new Promise<void>((resolve, reject) => {
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const accepted: File[] = [];
    const rejected: File[] = [];

    Array.from(files).forEach((file) => {
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

    for (const file of accepted) {
      const id = addUpload(file);
      try {
        await uploadFile(file, id);
      } catch {
        // error already set in uploadFile
      }
    }
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
    if (event.target) {
      event.target.value = "";
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  };

  const removeUploadById = (id: string) => {
    setUploads((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-y-6">
      <Card
        className="group flex w-full flex-col items-center justify-center gap-4 py-8 border-dashed text-sm cursor-pointer hover:bg-muted/50 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDropFiles}
        onClick={openFilePicker}
      >
        <div className="grid space-y-3">
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <Upload className="size-5" />
            <div>
              {t("drop_prefix")}{" "}
              <Button
                variant="outline"
                className="text-primary p-0 h-auto font-normal"
                onClick={openFilePicker}
                type="button"
              >
                {t("browse")}
              </Button>{" "}
              {t("drop_suffix")}
            </div>
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
        <span className="text-sm text-muted-foreground mt-2 block">
          {t("supported")}
        </span>
      </Card>

      <div className="flex flex-col gap-y-4">
        {activeUploads.length > 0 && (
          <div>
            <h2 className="text-balance text-foreground text-sm flex items-center font-semibold uppercase mb-4">
              <Loader2 className="size-4 mr-2 animate-spin" />
              {t("sections.uploading")}
            </h2>
            <div className="-mt-2 divide-y">
              {activeUploads.map((file) => (
                <div key={file.id} className="group flex items-center py-4">
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4" />
                  </div>
                  <div className="flex flex-col w-full mb-1">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-sm text-foreground">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress
                      value={file.progress}
                      className="mt-1 h-2 min-w-64"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeUploads.length > 0 && (completedUploads.length > 0 || erroredUploads.length > 0) && (
          <Separator className="my-0" />
        )}

        {completedUploads.length > 0 && (
          <div>
            <h2 className="text-balance text-foreground text-sm flex items-center font-semibold uppercase mb-4">
              <CheckCircle className="mr-2 size-4 text-primary" />
              {t("sections.finished")}
            </h2>
            <div className="-mt-2 divide-y">
              {completedUploads.map((file) => (
                <div key={file.id} className="group flex items-center py-4">
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4 group-hover:hidden" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden size-4 group-hover:inline p-0 h-auto"
                      onClick={() => removeUploadById(file.id)}
                      aria-label={t("remove")}
                      type="button"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col w-full mb-1">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-sm text-foreground">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress
                      value={file.progress}
                      className="mt-1 h-2 min-w-64"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {erroredUploads.length > 0 && (
          <div>
            <h2 className="text-balance text-foreground text-sm flex items-center font-semibold uppercase mb-4">
              <AlertTriangle className="mr-2 size-4 text-destructive" />
              {t("sections.failed")}
            </h2>
            <div className="-mt-2 divide-y">
              {erroredUploads.map((file) => (
                <div key={file.id} className="group flex items-center py-4">
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4 group-hover:hidden" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden size-4 group-hover:inline p-0 h-auto"
                      onClick={() => removeUploadById(file.id)}
                      aria-label={t("remove")}
                      type="button"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col w-full mb-1">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-sm text-foreground">
                        {file.name}
                      </span>
                      <span className="text-destructive text-sm">
                        {t("errors.label")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.error}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
