'use client'

import {
  LayoutDashboard,
  Building2,
  Users,
  MapPin,
  Radio,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const menuItems = [
    { label: 'Tableau de Bord', href: '/admin', icon: LayoutDashboard },
    { label: 'Sites', href: '/admin/sites', icon: Building2 },
    { label: 'Groupes', href: '/admin/groupes', icon: Users },
    { label: 'Lieux', href: '/admin/lieux', icon: MapPin },
    { label: 'Sondes', href: '/admin/sondes', icon: Radio },
    { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Admin Panel
          </h1>
          <p className="text-xs text-gray-500 mt-1">Vigitemp</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Icon className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
