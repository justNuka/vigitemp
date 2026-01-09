import { notFound } from "next/navigation"
import { getHotlinePublicConfig } from "@/lib/hotline-config"
import { HotlineLoginForm } from "../_components/hotline-login-form"

type HotlineLoginPageProps = {
  params: Promise<{ slug: string }>
}

export default async function HotlineLoginPage({ params }: HotlineLoginPageProps) {
  const { slug } = await params
  const config = await getHotlinePublicConfig()

  if (!config.slug || config.slug !== slug) {
    return notFound()
  }

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center">
      <HotlineLoginForm slug={slug} username={config.username} />
    </div>
  )
}
