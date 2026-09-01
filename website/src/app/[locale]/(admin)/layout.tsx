import { connection } from "next/server";

import { AdminGroupLayoutClient } from "./admin-layout-client";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Les pages d'administration lisent des données propres à l'installation
  // cliente. Elles ne doivent donc pas interroger la base pendant `next build`.
  // `connection()` force le rendu à la requête tout en laissant les fonctions
  // `use cache` de la sous-arborescence gérer leur cache au runtime.
  await connection();

  return <AdminGroupLayoutClient>{children}</AdminGroupLayoutClient>;
}
