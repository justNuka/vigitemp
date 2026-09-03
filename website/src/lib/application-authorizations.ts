import { prisma } from "@/lib/prisma";

const APPLICATION_AUTHORIZATIONS = [
  {
    code: "ACQUITTER_ALARMES_MULTI_LIEUX",
    label: "Acquitter plusieurs lieux",
    description: "Acquitter des alarmes sur plusieurs lieux",
  },
] as const;

/**
 * Garantit que les autorisations ajoutées par l'application existent aussi
 * sur les bases déjà installées. Le catalogue reste idempotent et les droits
 * ne sont jamais affectés automatiquement aux profils non administrateurs.
 */
export async function ensureApplicationAuthorizations() {
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
}
