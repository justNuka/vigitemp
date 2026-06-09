"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  draggable?: boolean
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, draggable = true, style, ...props }, ref) => {
  const contentRef = React.useRef<React.ComponentRef<typeof DialogPrimitive.Content> | null>(null)
  // Fix 3: use a ref instead of state — direct DOM mutation, zero re-renders during drag
  const offsetRef = React.useRef({ x: 0, y: 0 })
  const dragStateRef = React.useRef<{
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)

  const handlePointerMove = React.useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current
    const el = contentRef.current
    if (!dragState || !el) return

    const x = dragState.offsetX + event.clientX - dragState.startX
    const y = dragState.offsetY + event.clientY - dragState.startY
    offsetRef.current = { x, y }
    // Mutate the DOM directly — no setState, no re-render
    el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }, [])

  const stopDragging = React.useCallback(function stopDragging() {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", stopDragging)
    document.body.style.removeProperty("user-select")
    document.body.style.removeProperty("cursor")
  }, [handlePointerMove])

  const setRefs = React.useCallback(
    (node: React.ComponentRef<typeof DialogPrimitive.Content> | null) => {
      contentRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref],
  )

  const handlePointerDownCapture = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || event.button !== 0) return

      const content = contentRef.current
      if (!content) return

      const target = event.target as HTMLElement | null
      if (!target) return

      // Fix 1: reject clicks from nested dialog portals — they bubble up through
      // React's virtual tree even though they're not DOM children of this dialog
      if (!content.contains(target)) return

      // Fix 2: only allow drag from the dedicated handle, not the whole header zone
      if (!target.closest("[data-drag-handle]")) return

      dragStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        offsetX: offsetRef.current.x,
        offsetY: offsetRef.current.y,
      }

      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", stopDragging)
      // Fix 1: stop propagation so a parent dialog doesn't also start dragging
      event.stopPropagation()
    },
    [draggable, handlePointerMove, stopDragging],
  )

  React.useEffect(() => stopDragging, [stopDragging])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[calc(100vw-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg dark:bg-popover dark:text-popover-foreground duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1 sm:rounded-lg",
          className
        )}
        style={style}
        onPointerDownCapture={handlePointerDownCapture}
        {...props}
      >
        {draggable && (
          <div
            data-drag-handle
            aria-hidden="true"
            className="absolute top-2 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-muted-foreground/25 cursor-grab hover:bg-muted-foreground/40 transition-colors"
          />
        )}
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
