import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import {
  getHotlineAccessCookieName,
  getHotlineRefreshCookieName,
  verifyHotlineAccessToken,
  verifyHotlineRefreshToken,
} from "@/lib/hotline-auth"
import { HotlineDashboard } from "./_components/hotline-dashboard"

type HotlinePageProps = {
  params: Promise<{ slug: string; locale: string }>
}

export default async function HotlinePage({ params }: HotlinePageProps) {
  const resolvedParams = await params
  const tCommon = await getTranslations({ locale: resolvedParams.locale, namespace: "common" })

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          {tCommon("loading")}
        </div>
      }
    >
      <HotlineGate slug={resolvedParams.slug} locale={resolvedParams.locale} />
    </Suspense>
  )
}

async function HotlineGate({ slug, locale }: { slug: string; locale: string }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(getHotlineAccessCookieName())?.value
  const refreshToken = cookieStore.get(getHotlineRefreshCookieName())?.value

  const accessSession = accessToken ? verifyHotlineAccessToken(accessToken) : null
  const refreshSession = refreshToken ? verifyHotlineRefreshToken(refreshToken) : null

  if (!accessSession && !refreshSession) {
    redirect(`/${locale}/hotline/${slug}/login`)
  }

  const session = accessSession ?? refreshSession

  return <HotlineDashboard slug={slug} username={session?.username ?? null} />
}
