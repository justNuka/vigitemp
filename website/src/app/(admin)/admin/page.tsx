'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner } from '@heroui/react'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) {
          router.push('/login')
          return
        }

        const user = await res.json()

        // Vérifier si l'utilisateur est administrateur
        if (user.profil !== 'Administrateurs') {
          router.push('/dashboard')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Summary Cards */}
      <div>
        <h1 className="text-3xl font-bold mb-6">Tableau de Bord Administrateur</h1>
        <p className="text-gray-500 mb-8">Gestion centralisée du système</p>
      </div>

      {/* Magic Bento - System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {/* Journal Système */}
        <div className="md:col-span-2 lg:row-span-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Journal Système</h2>
          <div className="overflow-auto max-h-96">
            <p className="text-gray-500 text-sm">Datatable - Colonnes à définir</p>
          </div>
        </div>

        {/* Utilisateurs Connectés */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Utilisateurs Connectés</h2>
          <div className="h-64 overflow-auto">
            <p className="text-gray-500 text-sm">Datatable - Colonnes à définir</p>
          </div>
        </div>

        {/* Alarmes en Cours */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Alarmes en Cours</h2>
          <div className="h-64 overflow-auto">
            <p className="text-gray-500 text-sm">Datatable - Colonnes à définir</p>
          </div>
        </div>

        {/* Acquittements d'Alarmes */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Journal Acquittements Alarmes</h2>
          <div className="overflow-auto max-h-64">
            <p className="text-gray-500 text-sm">Datatable - Colonnes à définir</p>
          </div>
        </div>

        {/* Sauvegarde Système */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Sauvegarde Système</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dernière sauvegarde: N/A
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition">
              Lancer Sauvegarde
            </button>
          </div>
        </div>

        {/* Lieux Non Affectés */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Lieux Non Affectés à des Utilisateurs</h2>
          <div className="overflow-auto max-h-64">
            <p className="text-gray-500 text-sm">Datatable - Colonnes à définir</p>
          </div>
        </div>
      </div>

      {/* Magic Bento - Admin Pages */}
      <div>
        <h2 className="text-2xl font-bold mb-6 mt-12">Gestion</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminPageCard
            title="Gestion des Sites"
            description="Créer, modifier et gérer les sites"
            emoji="🏢"
            href="/admin/sites"
          />
          <AdminPageCard
            title="Gestion des Groupes"
            description="Organiser les groupes de capteurs"
            emoji="👥"
            href="/admin/groupes"
          />
          <AdminPageCard
            title="Gestion des Lieux"
            description="Gérer les emplacements et zones de surveillance"
            emoji="📍"
            href="/admin/lieux"
          />
          <AdminPageCard
            title="Gestion des Sondes"
            description="Ajouter et configurer les capteurs"
            emoji="📊"
            href="/admin/sondes"
          />
          <AdminPageCard
            title="Gestion des Utilisateurs"
            description="Gérer les comptes et permissions"
            emoji="👤"
            href="/admin/utilisateurs"
          />
          <AdminPageCard
            title="Paramètres Système"
            description="Configuration générale et avancée"
            emoji="⚙️"
            href="/admin/parametres"
          />
        </div>
      </div>
    </div>
  )
}

function AdminPageCard({
  title,
  description,
  emoji,
  href,
}: {
  title: string
  description: string
  emoji: string
  href: string
}) {
  return (
    <a
      href={href}
      className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all"
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </a>
  )
}
