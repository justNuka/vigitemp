export function UtilisateursTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Login</th>
            <th className="text-left py-3 px-4 font-semibold">Nom</th>
            <th className="text-left py-3 px-4 font-semibold">Prénom</th>
            <th className="text-left py-3 px-4 font-semibold">Profil</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Archive</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
            <td colSpan={7} className="py-6 px-4 text-center text-gray-500">
              Aucun utilisateur - À implémenter
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
