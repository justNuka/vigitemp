"use client"

import { FlaskConical, GaugeCircle, LayoutDashboard, TestTubeDiagonal } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type MetrologySubpageKey = "dashboard" | "baths" | "adjustment" | "calibration"

type MetrologySubpagesCardsProps = {
  current: MetrologySubpageKey
}

const CARD_CONFIG = {
  dashboard: {
    href: "/admin/metrologie",
    icon: LayoutDashboard,
    titleKey: "dashboard.title",
    descriptionKey: "dashboard.description",
    ctaKey: "dashboard.cta",
  },
  baths: {
    href: "/admin/metrologie/bains-etalons",
    icon: FlaskConical,
    titleKey: "baths.title",
    descriptionKey: "baths.description",
    ctaKey: "baths.cta",
  },
  adjustment: {
    href: "/admin/metrologie/realiser-ajustage",
    icon: GaugeCircle,
    titleKey: "adjustment.title",
    descriptionKey: "adjustment.description",
    ctaKey: "adjustment.cta",
  },
  calibration: {
    href: "/admin/metrologie/realiser-etalonnage",
    icon: TestTubeDiagonal,
    titleKey: "calibration.title",
    descriptionKey: "calibration.description",
    ctaKey: "calibration.cta",
  },
} as const

export function MetrologySubpagesCards({ current }: MetrologySubpagesCardsProps) {
  const t = useTranslations("metrologyAdmin.subpagesCards")

  const cards = (Object.entries(CARD_CONFIG) as Array<
    [MetrologySubpageKey, (typeof CARD_CONFIG)[MetrologySubpageKey]]
  >).filter(([key]) => key !== current)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t("group.title")}</CardTitle>
        <CardDescription>{t("group.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid min-w-0 gap-4 md:grid-cols-3">
          {cards.map(([key, config]) => {
            const Icon = config.icon
            return (
              <Card key={key} className="min-w-0">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{t(config.titleKey)}</CardTitle>
                      <CardDescription>{t(config.descriptionKey)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={config.href}>{t(config.ctaKey)}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
