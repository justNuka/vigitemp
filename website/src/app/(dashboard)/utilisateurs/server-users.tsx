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
      Id_Utilisateur: true,
      Login: true,
      Nom: true,
      Prenom: true,
      Adresse_Email: true,
      Profil_Utilisateur: true,
      Est_Archive: true,
      Date_Creation: true,
    },
    orderBy: { Login: "asc" },
  });

  // Transform to User format
  const formatted = users.map((user) => ({
    id: user.Id_Utilisateur.toString(),
    username: user.Login || "",
    displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "",
    nom: user.Nom || "",
    prenom: user.Prenom || "",
    email: user.Adresse_Email || "",
    role: user.Profil_Utilisateur || "user",
    isActive: !user.Est_Archive,
    createdAt: user.Date_Creation || new Date(),
  }));

  return formatted;
}
