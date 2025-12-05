"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Composant serveur pour charger les utilisateurs depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerUsers() {
  "use cache";
  cacheTag("users-data");

  const users = await prisma.t_utilisateur.findMany({
    select: {
      IdUtilisateur: true,
      Login: true,
      Nom: true,
      Prenom: true,
      Adresse_Email: true,
      ProfilUtilisateur: true,
      Archive: true,
      Date_Creation: true,
    },
    orderBy: { Login: "asc" },
  });

  // Transform to User format
  const formatted = users.map((user) => ({
    id: user.IdUtilisateur.toString(),
    username: user.Login || "",
    displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "",
    nom: user.Nom || "",
    prenom: user.Prenom || "",
    email: user.Adresse_Email || "",
    role: user.ProfilUtilisateur === "admin" ? ("admin" as const) : ("user" as const),
    isActive: !user.Archive,
    createdAt: user.Date_Creation || new Date(),
  }));

  return formatted;
}
