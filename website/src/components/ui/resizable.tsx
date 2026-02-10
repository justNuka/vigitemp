"use client"

import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn(
      "flex h-full w-full",
      orientation === "vertical" ? "flex-col" : "flex-row",
      className
    )}
    orientation={orientation}
    {...props}
  />
)

const ResizablePanel = Panel

const ResizableHandle = ({
  withHandle,
  className,
  handleOrientation,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
  handleOrientation?: "horizontal" | "vertical"
}) => (
  <Separator
    className={cn(
      "relative flex items-center justify-center bg-border after:absolute focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      handleOrientation === "vertical"
        ? "h-px w-full after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2"
        : "h-full w-px after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          "z-10 flex items-center justify-center rounded-sm border bg-border",
          handleOrientation === "vertical" ? "h-3 w-4" : "h-4 w-3"
        )}
      >
        <GripVertical
          className={cn(
            "h-2.5 w-2.5",
            handleOrientation === "vertical" && "rotate-90"
          )}
        />
      </div>
    )}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
