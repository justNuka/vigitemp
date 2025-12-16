'use client'

import { AdminSidebar } from './admin/_components/admin-sidebar'

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
