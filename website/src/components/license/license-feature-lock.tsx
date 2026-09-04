import { LockKeyhole } from "lucide-react"

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
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div inert aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>

      <div className="absolute inset-0 z-20 rounded-xl" aria-label={title}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/70 to-background" />
        <div
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.35) 25%, #000 70%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.35) 25%, #000 70%)",
          }}
        />

        <div className="absolute inset-x-4 top-[56%] flex -translate-y-1/2 justify-center">
          <div className="max-w-xl rounded-2xl border border-border/70 bg-background/95 px-5 py-4 text-center shadow-lg backdrop-blur-md sm:px-7 sm:py-5">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted/70">
              <LockKeyhole className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
