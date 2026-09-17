import { prisma } from "@/lib/prisma";
import { repairLegacyUtf8Mojibake } from "@/lib/legacy-text-encoding";

const APPLICATION_AUTHORIZATIONS = [
  {
    code: "ACQUITTER_ALARMES_MULTI_LIEUX",
    label: "Acquitter plusieurs lieux",
    description: "Acquitter des alarmes sur plusieurs lieux",
  },
] as const;

async function repairLegacyAuthorizationEncoding(): Promise<number> {
  const authorizations = await prisma.t_autorisation.findMany({
    select: {
      Id_Autorisation: true,
      Libelle_Autorisation: true,
      Commentaire: true,
    },
  });

  const repairs = authorizations.flatMap((authorization) => {
    const label = repairLegacyUtf8Mojibake(authorization.Libelle_Autorisation);
    const description = repairLegacyUtf8Mojibake(authorization.Commentaire);

    if (
      label === authorization.Libelle_Autorisation &&
      description === authorization.Commentaire
    ) {
      return [];
    }

    return [
      prisma.t_autorisation.update({
        where: { Id_Autorisation: authorization.Id_Autorisation },
        data: {
          Libelle_Autorisation: label,
          Commentaire: description,
        },
      }),
    ];
  });

  if (repairs.length === 0) return 0;

  await prisma.$transaction(repairs);
  return repairs.length;
}

/**
 * Garantit que les autorisations ajoutées par l'application existent aussi
 * sur les bases déjà installées. Le catalogue reste idempotent et les droits
 * ne sont jamais affectés automatiquement aux profils non administrateurs.
 *
 * Répare également les anciens libellés UTF-8 qui ont pu être interprétés
 * avec une page de codes Windows lors d'un bootstrap SQL Server historique.
 */
export async function ensureApplicationAuthorizations(): Promise<number> {
  for (const authorization of APPLICATION_AUTHORIZATIONS) {
    const existing = await prisma.t_autorisation.findFirst({
      where: { Code_Autorisation: authorization.code },
      select: { Id_Autorisation: true },
    });

    if (existing) continue;

    await prisma.t_autorisation.create({
      data: {
        Code_Autorisation: authorization.code,
        Libelle_Autorisation: authorization.label,
        Commentaire: authorization.description,
      },
    });
  }

  return repairLegacyAuthorizationEncoding();
}
