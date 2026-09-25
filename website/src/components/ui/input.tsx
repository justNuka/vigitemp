import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        [
          "flex h-9 w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] text-foreground shadow-sm",
          "placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow,background-color] duration-150 ease-out",
          "hover:border-[hsl(var(--border-strong))]",
          "focus-visible:border-ring focus-visible:bg-card focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
          "disabled:cursor-not-allowed disabled:bg-[hsl(var(--surface-muted))] disabled:text-muted-foreground disabled:opacity-70",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        ].join(" "),
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = "Input"

export { Input }
