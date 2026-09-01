import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, X } from "lucide-react"

import type { UploadItem } from "../file-upload-shared"

type UploadStatusSectionProps = {
  title: string
  icon: React.ReactNode
  items: UploadItem[]
  emptyMessage: string
  removeLabel: string
  maxHeightClassName: string
  showProgress?: boolean
  showErrorLabel?: string
  onRemove?: (id: string) => void
}

export function UploadStatusSection({
  title,
  icon,
  items,
  emptyMessage,
  removeLabel,
  maxHeightClassName,
  showProgress = true,
  showErrorLabel,
  onRemove,
}: UploadStatusSectionProps) {
  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <h2 className="text-balance text-foreground text-sm flex items-center font-semibold uppercase">
        {icon}
        {title}
      </h2>
      <div className={`${maxHeightClassName} overflow-y-auto rounded-md border`}>
        {items.length === 0 ? (
          <div className="px-3 py-3 text-sm text-muted-foreground bg-card">{emptyMessage}</div>
        ) : (
          <div className="divide-y">
            {items.map((file) => (
              <div key={file.id} className="group flex items-center px-3 py-3 bg-card">
                <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                  <FileText className="inline size-4 group-hover:hidden" />
                  {onRemove ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden size-4 group-hover:inline p-0 h-auto"
                      onClick={() => onRemove(file.id)}
                      aria-label={removeLabel}
                      type="button"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-col w-full mb-1">
                  <div className="flex justify-between gap-2">
                    <span className="select-none text-sm text-foreground">{file.name}</span>
                    {showErrorLabel ? (
                      <span className="text-destructive text-sm">{showErrorLabel}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm tabular-nums">{file.progress}%</span>
                    )}
                  </div>
                  {showProgress ? (
                    <Progress value={file.progress} className="mt-1 h-2 min-w-64" />
                  ) : file.error ? (
                    <span className="text-xs text-muted-foreground">{file.error}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
