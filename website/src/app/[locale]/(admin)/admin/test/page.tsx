import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Beaker, Zap, Database, Clock } from "lucide-react"
import { Link } from "@/i18n/navigation"

export default async function TestIndexPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  const t = await getTranslations("testPages.index")

  const perfTests = [
    {
      title: t("cards.monitoring.title"),
      description: t("cards.monitoring.description"),
      href: "/admin/test/surveillance-perf",
      tags: ["sensors-data", "surveillance-stats"],
    },
    {
      title: t("cards.alarms.title"),
      description: t("cards.alarms.description"),
      href: "/admin/test/alarms-perf",
      tags: ["alarms-data", "alarms-stats"],
    },
    {
      title: t("cards.audit.title"),
      description: t("cards.audit.description"),
      href: "/admin/test/audit-perf",
      tags: ["audit-logs", "audit-stats"],
    },
    {
      title: t("cards.settings.title"),
      description: t("cards.settings.description"),
      href: "/admin/test/settings-perf",
      tags: ["parametres-data"],
    },
    {
      title: t("cards.users.title"),
      description: t("cards.users.description"),
      href: "/admin/test/users-perf",
      tags: ["users-data"],
    },
  ]

  const apiTools = [
    {
      title: t("api_revalidate.title"),
      description: t("api_revalidate.description"),
      href: "/api/revalidate",
      icon: Database,
      features: [
        t("api_revalidate.features.get"),
        t("api_revalidate.features.post"),
        t("api_revalidate.features.dev_only"),
      ],
    },
  ]

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 space-y-8">
      <DevModeBadge />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Beaker className="h-8 w-8 text-warning" />
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            {t("performance.title")}
          </h2>
          <p className="text-muted-foreground mb-4">{t("performance.description")}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {perfTests.map((test) => (
              <Card key={test.href}>
                <CardHeader>
                  <CardTitle className="text-base">{test.title}</CardTitle>
                  <CardDescription className="text-xs">{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {test.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={test.href}>
                    <Button className="w-full" size="sm">
                      <Zap className="mr-2 h-4 w-4" />
                      {t("actions.test")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            {t("api_tools.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {apiTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.href} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {tool.title}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">?</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={tool.href}>
                      <Button className="w-full">{t("actions.open_tool", { title: tool.title })}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-5 w-5" />
            {t("guide.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">{t("guide.step1_title")}</h4>
            <p className="text-muted-foreground">{t("guide.step1_description")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{t("guide.step2_title")}</h4>
            <p className="text-muted-foreground">{t("guide.step2_description")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">{t("guide.step3_title")}</h4>
            <p className="text-muted-foreground">{t("guide.step3_description")}</p>
          </div>
          <div className="pt-2 border-t">
            <h4 className="font-semibold mb-1">{t("guide.build_title")}</h4>
            <code className="block bg-muted p-2 rounded mt-1">npm run build:test && npm run start:test</code>
            <p className="text-muted-foreground mt-1">{t("guide.build_description")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
