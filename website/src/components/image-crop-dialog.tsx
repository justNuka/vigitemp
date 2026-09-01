"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ImageMinus, ImagePlus } from "lucide-react"
import { useTranslations } from "next-intl"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  onConfirm: (file: File) => void
  title?: string
  cancelLabel?: string
  confirmLabel?: string
  zoomLabel?: string
  resetLabel?: string
}

const VIEWPORT_WIDTH = 500
const VIEWPORT_HEIGHT = 240
const SELECTION_SIZE = 220

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ImageCropDialog({
  open,
  onOpenChange,
  file,
  onConfirm,
  title,
  cancelLabel,
  confirmLabel,
  zoomLabel,
  resetLabel,
}: Props) {
  const tCommon = useTranslations("common")
  const tFilters = useTranslations("surveillance.filters.actions")
  const resolvedTitle = title ?? tCommon("edit")
  const resolvedCancelLabel = cancelLabel ?? tCommon("cancel")
  const resolvedConfirmLabel = confirmLabel ?? tCommon("confirm")
  const resolvedResetLabel = resetLabel ?? tFilters("clear")
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const baseScale = useMemo(() => {
    const w = naturalSize.width || 1
    const h = naturalSize.height || 1
    return Math.max(SELECTION_SIZE / w, SELECTION_SIZE / h)
  }, [naturalSize.height, naturalSize.width])

  const totalScale = baseScale * zoom

  const maxOffsets = useMemo(() => {
    const maxX = Math.max(0, (naturalSize.width * totalScale - SELECTION_SIZE) / 2)
    const maxY = Math.max(0, (naturalSize.height * totalScale - SELECTION_SIZE) / 2)
    return { x: maxX, y: maxY }
  }, [naturalSize.height, naturalSize.width, totalScale])

  const clampedOffset = useMemo(
    () => ({
      x: clamp(offset.x, -maxOffsets.x, maxOffsets.x),
      y: clamp(offset.y, -maxOffsets.y, maxOffsets.y),
    }),
    [maxOffsets.x, maxOffsets.y, offset.x, offset.y],
  )

  const applyCrop = async () => {
    if (!file) return
    const img = imgRef.current
    if (!img) return

    const canvas = document.createElement("canvas")
    canvas.width = SELECTION_SIZE
    canvas.height = SELECTION_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const srcW = SELECTION_SIZE / totalScale
    const srcH = SELECTION_SIZE / totalScale
    const srcX = naturalSize.width / 2 - (SELECTION_SIZE / 2 + clampedOffset.x) / totalScale
    const srcY = naturalSize.height / 2 - (SELECTION_SIZE / 2 + clampedOffset.y) / totalScale

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, SELECTION_SIZE, SELECTION_SIZE)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.92))
    if (!blob) return

    const croppedFile = new File([blob], `avatar-${Date.now()}.png`, { type: "image/png" })
    onConfirm(croppedFile)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-155 border-border bg-background text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold tracking-tight">{resolvedTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="mx-auto rounded-lg border border-border bg-muted/40 p-4">
            <div
              className="relative overflow-hidden rounded-lg border border-border/70 bg-background touch-none"
              style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}
              onPointerDown={(event) => {
                dragRef.current = { x: event.clientX, y: event.clientY }
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={(event) => {
                if (!dragRef.current) return
                const dx = event.clientX - dragRef.current.x
                const dy = event.clientY - dragRef.current.y
                dragRef.current = { x: event.clientX, y: event.clientY }

                setOffset((current) => ({
                  x: clamp(current.x + dx, -maxOffsets.x, maxOffsets.x),
                  y: clamp(current.y + dy, -maxOffsets.y, maxOffsets.y),
                }))
              }}
              onPointerUp={(event) => {
                dragRef.current = null
                event.currentTarget.releasePointerCapture(event.pointerId)
              }}
              onPointerCancel={() => {
                dragRef.current = null
              }}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Raw <img> is required for precise canvas crop and natural dimensions.
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt=""
                  draggable={false}
                  onLoad={(event) => {
                    const target = event.currentTarget
                    setNaturalSize({ width: target.naturalWidth, height: target.naturalHeight })
                    setZoom(1)
                    setOffset({ x: 0, y: 0 })
                  }}
                  style={{
                    width: naturalSize.width,
                    height: naturalSize.height,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(calc(-50% + ${clampedOffset.x}px), calc(-50% + ${clampedOffset.y}px)) scale(${totalScale})`,
                    transformOrigin: "center center",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              ) : null}

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle ${SELECTION_SIZE / 2}px at 50% 50%, rgba(15,23,42,0) 0 ${SELECTION_SIZE / 2 - 2}px, rgba(15,23,42,0.38) ${SELECTION_SIZE / 2}px)`
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 pointer-events-none rounded-full border-4 border-primary/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.02)]"
                style={{
                  width: SELECTION_SIZE,
                  height: SELECTION_SIZE,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <ImageMinus className="h-4 w-4 text-muted-foreground" />
            <div className="w-70">
              {zoomLabel ? <div className="mb-1 text-center text-xs text-muted-foreground">{zoomLabel}</div> : null}
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                aria-label={resolvedTitle}
                className="w-full accent-primary"
              />
            </div>
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setZoom(1)
              setOffset({ x: 0, y: 0 })
            }}
          >
            {resolvedResetLabel}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {resolvedCancelLabel}
            </Button>
            <Button
              type="button"
              onClick={applyCrop}
              disabled={!file}
            >
              {resolvedConfirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
