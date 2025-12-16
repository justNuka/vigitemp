'use client'

import { ParametresForm } from './_components/parametres-form'

export default function ParametresPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres Système</h1>
        <p className="text-gray-500 mt-2">Configuration générale et avancée</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <ParametresForm />
      </div>
    </div>
  )
}
