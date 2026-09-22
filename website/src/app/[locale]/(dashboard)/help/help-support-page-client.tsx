"use client"

import {
  Activity,
  BellRing,
  Building2,
  CircleHelp,
  FolderTree,
  Mail,
  MapPin,
  Phone,
  RadioTower,
  ShieldCheck,
  Siren,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { PageHeader } from "@/components/page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { WEB_APP_VERSION } from "@/lib/app-version"
import {
  VIGISENSYS_SUPPORT_EMAIL,
  VIGISENSYS_SUPPORT_PHONE,
} from "@/lib/support-contact"

const concepts = [
  { key: "sites", Icon: Building2 },
  { key: "groups", Icon: FolderTree },
  { key: "locations", Icon: MapPin },
  { key: "sensors", Icon: RadioTower },
  { key: "monitoring", Icon: Activity },
  { key: "alarms", Icon: Siren },
] as const

const tutorials = [
  "unassignedSensor",
  "acknowledgeAlarm",
  "pauseMonitoring",
  "viewHistory",
] as const

const tutorialStepCounts: Record<(typeof tutorials)[number], number> = {
  unassignedSensor: 7,
  acknowledgeAlarm: 4,
  pauseMonitoring: 4,
  viewHistory: 4,
}

export function HelpSupportPageClient() {
  const t = useTranslations("helpSupport")

  const mailSubject = t("contact.mail.subject")
  const mailBody = [
    t("contact.mail.greeting"),
    "",
    t("contact.mail.intro"),
    "",
    `${t("contact.mail.fields.organization")} : `,
    `${t("contact.mail.fields.contact")} : `,
    `${t("contact.mail.fields.phone")} : `,
    `${t("contact.mail.fields.version")} : ${WEB_APP_VERSION}`,
    `${t("contact.mail.fields.page")} : `,
    `${t("contact.mail.fields.location")} : `,
    `${t("contact.mail.fields.sensor")} : `,
    "",
    `${t("contact.mail.fields.subject")} : `,
    "",
    `${t("contact.mail.fields.description")} :`,
    "",
    "",
    `${t("contact.mail.fields.steps")} :`,
    "",
    "",
    `${t("contact.mail.fields.error")} :`,
    "",
    "",
    t("contact.mail.closing"),
  ].join("\n")
  const mailtoHref = `mailto:${VIGISENSYS_SUPPORT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <PageHeader
        title={t("header.title")}
        description={t("header.description")}
      />

      <main className="mx-auto w-full max-w-7xl space-y-8 p-4 md:p-6">
        <Card className="overflow-hidden border-primary/25 bg-primary/5">
          <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit gap-1.5">
                <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
                {t("intro.badge")}
              </Badge>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("intro.title")}
                </h2>
                <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  {t("intro.description")}
                </p>
                <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                  {t("intro.hotline")}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href="#hotline-contact">{t("intro.contactCta")}</a>
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-4" aria-labelledby="help-concepts-title">
          <div className="space-y-1">
            <h2 id="help-concepts-title" className="text-2xl font-semibold tracking-tight">
              {t("concepts.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("concepts.description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {concepts.map(({ key, Icon }) => (
              <Card key={key} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {t(`concepts.items.${key}.title`)}
                      </CardTitle>
                      <CardDescription>
                        {t(`concepts.items.${key}.description`)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="help-actions-title">
          <div className="space-y-1">
            <h2 id="help-actions-title" className="text-2xl font-semibold tracking-tight">
              {t("actions.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("actions.description")}
            </p>
          </div>

          <Card>
            <CardContent className="p-4 md:p-6">
              <Accordion type="single" collapsible defaultValue="unassignedSensor">
                {tutorials.map((tutorial) => (
                  <AccordionItem key={tutorial} value={tutorial}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="pr-4">
                        {t(`actions.items.${tutorial}.title`)}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {t(`actions.items.${tutorial}.description`)}
                        </p>
                        <ol className="space-y-3">
                          {Array.from({ length: tutorialStepCounts[tutorial] }, (_, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <p className="pt-1 text-sm leading-relaxed">
                                {t(`actions.items.${tutorial}.steps.${index + 1}`)}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <Card className="border-amber-300/60 bg-amber-50/70 dark:border-amber-500/35 dark:bg-amber-500/10">
          <CardContent className="flex gap-3 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium">{t("permissions.title")}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("permissions.description")}
              </p>
            </div>
          </CardContent>
        </Card>

        <section id="hotline-contact" className="scroll-mt-6">
          <Card className="overflow-hidden border-primary/30">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-primary/10 p-3 text-primary">
                  <BellRing className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <CardTitle>{t("contact.title")}</CardTitle>
                  <CardDescription className="max-w-3xl">
                    {t("contact.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`mailto:${VIGISENSYS_SUPPORT_EMAIL}`}
                  className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">
                      {t("contact.emailLabel")}
                    </span>
                    <span className="block truncate text-sm font-medium">
                      {VIGISENSYS_SUPPORT_EMAIL}
                    </span>
                  </span>
                </a>

                <a
                  href={`tel:${VIGISENSYS_SUPPORT_PHONE.href}`}
                  className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="rounded-md bg-primary/10 p-2 text-primary">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">
                      {t("contact.phoneLabel")}
                    </span>
                    <span className="block text-sm font-medium">
                      {VIGISENSYS_SUPPORT_PHONE.display}
                    </span>
                  </span>
                </a>
              </div>

              <Button asChild size="lg" className="gap-2">
                <a href={mailtoHref}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {t("contact.write")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
