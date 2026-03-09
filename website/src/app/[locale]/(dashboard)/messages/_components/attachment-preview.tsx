"use client"

import { FileText, Download, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Attachment } from "./_types"

type Props = {
  attachment: Attachment
  isOwn: boolean
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentPreview({ attachment, isOwn }: Props) {
  const isImage = attachment.mimeType.startsWith("image/")
  const downloadUrl = `/api/chat/attachments/${attachment.id}`

  if (isImage) {
    return (
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={downloadUrl}
          alt={attachment.fileName}
          className="max-w-60 max-h-[200px] rounded-lg object-cover border border-border/40 hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    )
  }

  return (
    <a
      href={downloadUrl}
      download={attachment.fileName}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs border transition-colors hover:opacity-80",
        isOwn
          ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
          : "border-border/60 bg-muted/40 text-foreground"
      )}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate font-medium">{attachment.fileName}</span>
      <span className="text-[10px] opacity-60 shrink-0">{formatSize(attachment.size)}</span>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  )
}
