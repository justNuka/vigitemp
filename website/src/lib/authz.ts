import { prisma } from "@/lib/prisma";

export async function isAdminUser(userId: number): Promise<boolean> {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  });

  if (!user?.Profil_Utilisateur) return false;

  const profil = await prisma.t_profil.findUnique({
    where: { Profil_Utilisateur: user.Profil_Utilisateur },
    include: {
      t_liaison_profil_autorisation: {
        include: { t_autorisation: true },
      },
    },
  });

  if (!profil) return false;

  return profil.t_liaison_profil_autorisation.some(
    (liaison) => liaison.t_autorisation.A_Acces_Admin === true
  );
}

export async function hasUserAuthorizationCode(
  userId: number,
  code: string
): Promise<boolean> {
  const user = await prisma.t_utilisateur.findUnique({
    where: { Id_Utilisateur: userId },
    select: { Profil_Utilisateur: true },
  });

  if (!user?.Profil_Utilisateur) return false;
  if (user.Profil_Utilisateur === "Administrateurs") return true;

  const profil = await prisma.t_profil.findUnique({
    where: { Profil_Utilisateur: user.Profil_Utilisateur },
    include: {
      t_liaison_profil_autorisation: {
        include: { t_autorisation: true },
      },
    },
  });

  if (!profil) return false;

  return profil.t_liaison_profil_autorisation.some(
    (liaison) => liaison.t_autorisation.Code_Autorisation === code
  );
}
