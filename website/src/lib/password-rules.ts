import type { PasswordRules } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function getPasswordRulesFromDb(): Promise<PasswordRules> {
  const securityParams = await prisma.t_parametre.findMany({
    where: { Section: "SECURITE_MOT_DE_PASSE" },
    select: { Mot_Cle: true, Valeur: true },
  });

  const cfr21Params = await prisma.t_parametre.findMany({
    where: { Section: "CFR21" },
    select: { Mot_Cle: true, Valeur: true },
  });

  const securityRules = securityParams.reduce((acc, param) => {
    acc[param.Mot_Cle] = parseInt(param.Valeur || "0", 10);
    return acc;
  }, {} as Record<string, number>);

  const cfr21Rules = cfr21Params.reduce((acc, param) => {
    if (param.Mot_Cle === "ACTIVATION_NORME_CFR21") {
      acc[param.Mot_Cle] =
        param.Valeur === "1" || param.Valeur?.toLowerCase() === "true";
    } else if (param.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE") {
      acc[param.Mot_Cle] =
        param.Valeur === "1" || param.Valeur?.toLowerCase() === "true";
    } else {
      acc[param.Mot_Cle] = parseInt(param.Valeur || "0", 10);
    }
    return acc;
  }, {} as Record<string, number | boolean>);

  return {
    min_length: securityRules.LONGUEUR_MINIMALE ?? 8,
    min_uppercase: securityRules.MIN_LETTRES_MAJUSCULES ?? 1,
    min_lowercase: securityRules.MIN_LETTRES_MINUSCULES ?? 1,
    min_numbers: securityRules.MIN_CHIFFRES ?? 1,
    min_special: securityRules.MIN_CARACTERES_SPECIAUX ?? 1,
    cfr21_enabled: (cfr21Rules.ACTIVATION_NORME_CFR21 as boolean) ?? false,
    history_count: (cfr21Rules.NOMBRE_ANCIENS_MOT_DE_PASSE as number) ?? 5,
    expiry_days: (cfr21Rules.JOURS_VALIDITE_MOT_DE_PASSE as number) ?? 90,
    expiry_enabled:
      (cfr21Rules.ACTIVATION_EXPIRATION_MOT_DE_PASSE as boolean) ?? false,
  };
}

