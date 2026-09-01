import { prisma } from "@/lib/prisma";
import { getUserAvatarMap } from "@/lib/user-avatar-db";

/**
 * Charge les utilisateurs à la requête, après le point d'accès dynamique
 * déclaré par la page admin.
 */
export async function ServerUsers() {
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

  const avatarMap = await getUserAvatarMap(users.map((user) => user.Id_Utilisateur));

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
    avatar: avatarMap.get(user.Id_Utilisateur) ?? null,
  }));

  return formatted;
}
