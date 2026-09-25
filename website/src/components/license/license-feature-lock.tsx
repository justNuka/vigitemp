import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"

type LicenseFeatureLockProps = {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function LicenseFeatureLock({
  children,
  title,
  description,
  className,
}: LicenseFeatureLockProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        inert
        aria-hidden="true"
        className="pointer-events-none h-full select-none opacity-50 blur-[1.5px] [&_*]:!shadow-none"
      >
        {children}
      </div>

      <div
        role="note"
        className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[hsl(var(--border-strong))] bg-card/75 px-6 text-center backdrop-blur-[1px]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
          <Lock className="h-4 w-4" aria-hidden />
        </span>
        <p className="mt-2 text-[13px] font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 max-w-xs text-xs leading-4 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
