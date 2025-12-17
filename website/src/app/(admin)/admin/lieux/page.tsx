'use client'

import { LieuxTable } from './_components/lieux-table'

export default function LieuxPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Lieux</h1>
        <p className="text-gray-500 mt-2">Gérer les emplacements et zones de surveillance</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Lieux</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + Nouveau Lieu
          </button>
        </div>
        <LieuxTable />
      </div>
    </div>
  )
}
