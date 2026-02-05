import { Suspense } from "react"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getHotlineConfig } from "@/lib/hotline-config"
import { getHotlineCookieName, verifyHotlineToken } from "@/lib/hotline-auth"
import { HotlineDashboard } from "./_components/hotline-dashboard"

type HotlinePageProps = {
  params: Promise<{ slug: string; locale: string }>
}

export default function HotlinePage({ params }: HotlinePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Chargementâ€¦
        </div>
      }
    >
      <HotlineGate params={params} />
    </Suspense>
  )
}

async function HotlineGate({ params }: HotlinePageProps) {
  const { slug, locale } = await params
  const config = await getHotlineConfig()

  if (!config.slug || config.slug !== slug) {
    return notFound()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(getHotlineCookieName())?.value
  const session = token ? verifyHotlineToken(token) : null
  if (!session) {
    redirect(`/${locale}/hotline/${slug}/login`)
  }

  return <HotlineDashboard slug={slug} />
}
