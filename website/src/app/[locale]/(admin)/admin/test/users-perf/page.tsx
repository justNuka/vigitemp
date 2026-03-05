import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { DevModeBadge } from "@/components/dev-mode-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, User as UserIcon } from "lucide-react"

export default async function UsersPerfTestPage() {
  if (!FEATURE_FLAGS.enableTestPages) {
    notFound()
  }

  const t = await getTranslations("testPages.users")

  return (
    <div className="min-h-screen p-6 space-y-6">
      <DevModeBadge />

      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("instructions.title")}</CardTitle>
            <CardDescription>{t("instructions.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step1_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step1_description")}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step2_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step2_description")}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("instructions.step3_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("instructions.step3_description")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cards.users_title")}</CardTitle>
            <CardDescription>{t("cards.users_cache")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <UsersDisplay />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("cache_tags.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>users-data</Badge>
              <span className="text-sm text-muted-foreground">{t("cache_tags.users")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function UsersDisplay() {
  const t = await getTranslations("testPages.users")
  const users: any[] = []
  const duration = 0

  const adminCount = users.filter((u) => u.role === "admin").length
  const activeCount = users.filter((u) => u.isActive).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">{t("stats.total")}</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">{t("stats.admins")}</p>
          <p className="text-2xl font-bold">{adminCount}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded">
          <p className="text-muted-foreground mb-1">{t("stats.active")}</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
      </div>

      <div className="space-y-2">
        {users.slice(0, 6).map((user) => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded">
            <div className="flex-1">
              <p className="font-medium text-sm">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="gap-1">
                {user.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                {user.role === "admin" ? t("roles.admin") : t("roles.user")}
              </Badge>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? t("statuses.active") : t("statuses.inactive")}
              </Badge>
            </div>
          </div>
        ))}
        {users.length > 6 ? <p className="text-xs text-muted-foreground text-center pt-2">{t("more", { count: users.length - 6 })}</p> : null}
      </div>

      <p className="text-xs text-muted-foreground pt-4 border-t">{t("loaded_count", { count: users.length, duration })}</p>
    </div>
  )
}
