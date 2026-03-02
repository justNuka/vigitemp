import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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

export default function HotlinePage({ params }: HotlinePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Chargement...
        </div>
      }
    >
      <HotlineGate params={params} />
    </Suspense>
  )
}

async function HotlineGate({ params }: HotlinePageProps) {
  const { slug, locale } = await params

  const cookieStore = await cookies()
  const accessToken = cookieStore.get(getHotlineAccessCookieName())?.value
  const refreshToken = cookieStore.get(getHotlineRefreshCookieName())?.value

  const accessSession = accessToken ? verifyHotlineAccessToken(accessToken) : null
  const refreshSession = refreshToken ? verifyHotlineRefreshToken(refreshToken) : null

  if (!accessSession && !refreshSession) {
    redirect(`/${locale}/hotline/${slug}/login`)
  }

  return <HotlineDashboard slug={slug} />
}