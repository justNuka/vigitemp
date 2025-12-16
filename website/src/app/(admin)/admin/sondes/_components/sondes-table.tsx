export function SondesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Numéro Série</th>
            <th className="text-left py-3 px-4 font-semibold">Adresse</th>
            <th className="text-left py-3 px-4 font-semibold">État</th>
            <th className="text-left py-3 px-4 font-semibold">Port Série</th>
            <th className="text-left py-3 px-4 font-semibold">Fréquence</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
            <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
              Aucune sonde - À implémenter
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
