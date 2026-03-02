import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Authorization, CurrentUser } from "@/lib/types";
import { withAuthLogging } from "@/lib/api-wrappers";
import { getUserAvatarValue } from "@/lib/user-avatar-db";
import { apiError, apiOk } from "@/lib/api-response";

export const GET = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    // Get full user data from database
    const fullUser = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: ctx.user.userId },
    });

    if (!fullUser || fullUser.Est_Archive) {
      return apiError(404, "not_found", "User not found");
    }

    // Get user's profile and associated authorizations
    let authorizations: Authorization[] = [];
    if (fullUser.Profil_Utilisateur) {
      const profil = await prisma.t_profil.findUnique({
        where: { Profil_Utilisateur: fullUser.Profil_Utilisateur },
        include: {
          t_liaison_profil_autorisation: {
            include: {
              t_autorisation: true,
            },
          },
        },
      });

      if (profil) {
        authorizations = profil.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.Id_Autorisation,
          code: liaison.t_autorisation.Code_Autorisation || "",
          libelle: liaison.t_autorisation.Libelle_Autorisation || "",
        }));
      }
    }

    // Get CFR21 configuration from parameters
    const cfr21Params = await prisma.t_parametre.findMany({
      where: {
        Section: "CFR21",
      },
    });

    const cfr21Enabled = cfr21Params.some(
      (p) => p.Mot_Cle === "ACTIVATION_NORME_CFR21" && (p.Valeur === "true" || p.Valeur === "1")
    );
    const cfr21PasswordMaxAge = cfr21Params.find(
      (p) => p.Mot_Cle === "VALIDITE_MOT_DE_PASSE_JOURS"
    )?.Valeur;
    const cfr21NonReuseablePasswords = cfr21Params.find(
      (p) => p.Mot_Cle === "MOT_DE_PASSE_REUTILISABLE"
    )?.Valeur === "0";

    const avatarValue = await getUserAvatarValue(fullUser.Id_Utilisateur);

    const [groupLinks, siteLinks, userSite] = await Promise.all([
      prisma.t_liaison_utilisateur_groupe.findMany({
        where: { Id_Utilisateur: fullUser.Id_Utilisateur },
        include: { t_groupe: { select: { Id_Groupe: true, Nom_Groupe: true } } },
        orderBy: { Id_Liaison_u_g: "asc" },
      }),
      prisma.t_liaison_utilisateur_site.findMany({
        where: { Id_Utilisateur: fullUser.Id_Utilisateur },
        include: { t_site: { select: { Id_Site: true, Libelle_Site: true } } },
        orderBy: { Id_Liaison: "asc" },
      }),
      fullUser.Id_Site
        ? prisma.t_site.findUnique({
            where: { Id_Site: fullUser.Id_Site },
            select: { Id_Site: true, Libelle_Site: true },
          })
        : Promise.resolve(null),
    ]);

    const linkedSites = siteLinks
      .map((link) => link.t_site)
      .filter((site): site is { Id_Site: number; Libelle_Site: string | null } => Boolean(site))
      .map((site) => ({
        id: site.Id_Site,
        name: site.Libelle_Site || "",
      }));

    const mergedSites = [...linkedSites];
    if (userSite && !mergedSites.some((site) => site.id === userSite.Id_Site)) {
      mergedSites.unshift({ id: userSite.Id_Site, name: userSite.Libelle_Site || "" });
    }

    const response: CurrentUser = {
      id: fullUser.Id_Utilisateur,
      Login: fullUser.Login || "",
      Nom: fullUser.Nom || null,
      Prenom: fullUser.Prenom || null,
      Adresse_Email: fullUser.Adresse_Email || null,
      Profil_Utilisateur: fullUser.Profil_Utilisateur || null,
      Date_Creation: fullUser.Date_Creation,
      profil: fullUser.Profil_Utilisateur || null,
      Date_Derniere_Modification_MDP: fullUser.Date_Derniere_Modification_MDP,
      Avatar_Utilisateur: avatarValue,
      authorizations,
      cfr21: {
        enabled: cfr21Enabled,
        passwordMaxAgeDays: cfr21PasswordMaxAge ? parseInt(cfr21PasswordMaxAge) : 90,
        nonReuseable: cfr21NonReuseablePasswords,
      },
      groups: groupLinks
        .map((link) => link.t_groupe)
        .filter((group): group is { Id_Groupe: number; Nom_Groupe: string | null } => Boolean(group))
        .map((group) => ({ id: group.Id_Groupe, name: group.Nom_Groupe || "" })),
      sites: mergedSites,
    };

    return apiOk(response);
  } catch (error) {
    console.error("Get current user error:", error);
    return apiError(500, "internal_error", "Internal server error");
  }
});
