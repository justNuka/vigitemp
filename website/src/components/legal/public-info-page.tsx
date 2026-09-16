import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import { AppFooter } from "@/components/app-footer"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export function PublicInfoPage({
  title,
  intro,
  badge,
  backLabel,
  children,
}: {
  title: string
  intro: string
  badge: string
  backLabel: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Logo size="md" showText />
          <Button asChild variant="outline" size="sm">
            <Link href="/login" className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-10 space-y-4">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            {badge}
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">{intro}</p>
          </div>
        </div>

        <div className="space-y-6">{children}</div>
      </main>

      <AppFooter />
    </div>
  )
}

export function PublicInfoSection({
  title,
  children,
  id,
}: {
  title: string
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  )
}
