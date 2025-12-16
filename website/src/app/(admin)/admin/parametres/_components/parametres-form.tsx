export function ParametresForm() {
  return (
    <form className="space-y-6">
      <h2 className="text-lg font-semibold mb-6">Paramètres Système</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nom du Système</label>
          <input
            type="text"
            placeholder="Vigitemp"
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Configuration SMTP</label>
          <input
            type="text"
            placeholder="À implémenter"
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Autres Paramètres</label>
          <textarea
            placeholder="À implémenter"
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 h-32"
            disabled
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Sauvegarder
        </button>
        <button
          type="reset"
          className="px-6 py-2 border border-gray-200 dark:border-slate-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
