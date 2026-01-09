import type { ReactNode } from "react"

type HotlineLayoutProps = {
  children: ReactNode
}

export default function HotlineLayout({ children }: HotlineLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        {children}
      </div>
    </div>
  )
}
