import { HotlineLoginForm } from "../_components/hotline-login-form"

type HotlineLoginPageProps = {
  params: Promise<{ slug: string }>
}

export default async function HotlineLoginPage({ params }: HotlineLoginPageProps) {
  const { slug } = await params

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center">
      <HotlineLoginForm slug={slug} />
    </div>
  )
}