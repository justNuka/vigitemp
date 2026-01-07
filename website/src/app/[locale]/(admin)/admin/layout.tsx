"use client";

import { AdminNavDock } from "@/components/admin-nav-dock";
import { useAutoLock } from "@/hooks/useAutoLock";
import PageTransitionWrapper from "@/components/animations/transitions/page-transitions/PageTransitionWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Activer le verrouillage automatique pour toutes les pages protégées
  useAutoLock();

  // Obtenir l'intervalle de rafraîchissement depuis les paramètres

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      {/* Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto bg-background pb-20">
        <PageTransitionWrapper className="min-h-full">
          {children}
        </PageTransitionWrapper>
      </main>
      
      {/* Admin Navigation Dock (bottom) */}
      <AdminNavDock />
    </div>
  );
}
