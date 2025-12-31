import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Authorization, CurrentUser } from "@/lib/types";
import { withAuthLogging } from "@/lib/api-wrappers";
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
        authorizations = profil.t_liaison_profil_autorisation.map(
          (liaison) => ({
            id: liaison.t_autorisation.Id_Autorisation,
            code: liaison.t_autorisation.Code_Autorisation || "",
            libelle: liaison.t_autorisation.Libelle_Autorisation || "",
            admin: liaison.t_autorisation.A_Acces_Admin || false,
            metrologie: liaison.t_autorisation.A_Acces_Metrologie || false,
            surveillance: liaison.t_autorisation.A_Acces_Surveillance || false,
            vigilog: liaison.t_autorisation.A_Acces_VigiLog || false,
          })
        );
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
      authorizations,
      cfr21: {
        enabled: cfr21Enabled,
        passwordMaxAgeDays: cfr21PasswordMaxAge ? parseInt(cfr21PasswordMaxAge) : 90,
        nonReuseable: cfr21NonReuseablePasswords,
      },
    };

    return apiOk(response);
  } catch (error) {
    console.error("Get current user error:", error);
    return apiError(500, "internal_error", "Internal server error");
  }
});
