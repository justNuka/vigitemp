import { prisma } from "@/lib/prisma";
import { isAdminDomainCode } from "@/lib/authorization-domain";

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

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    isAdminDomainCode(liaison.t_autorisation.Code_Autorisation),
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


export async function hasUserAnyAuthorizationCode(
  userId: number,
  codes: readonly string[],
): Promise<boolean> {
  if (codes.length === 0) return false;

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

  const expected = new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean));
  if (expected.size === 0) return false;

  return profil.t_liaison_profil_autorisation.some((liaison) =>
    expected.has((liaison.t_autorisation.Code_Autorisation || "").trim().toUpperCase()),
  );
}
