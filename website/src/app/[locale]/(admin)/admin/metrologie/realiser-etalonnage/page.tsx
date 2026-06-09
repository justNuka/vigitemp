"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { MetrologySubpagesCards } from "../_components/metrology-subpages-cards"

export default function RealiserEtalonnagePage() {
  const t = useTranslations("metrologyAdmin.calibrationPage")
  return (
    <>
      <PageHeader title={t("header.title")} description={t("header.description")} />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("card.title")}</CardTitle>
            <CardDescription>{t("card.description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("card.content")}
          </CardContent>
        </Card>
        <MetrologySubpagesCards current="calibration" />
      </div>
    </>
  )
}
