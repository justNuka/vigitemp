import { NextRequest } from "next/server";

import { getRequestContext } from "@/lib/api-logger";
import { apiError, apiOk } from "@/lib/api-response";
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

function getCaseCandidates(section: string, motCle: string) {
  const sectionLower = section.toLowerCase();
  const sectionUpper = section.toUpperCase();
  const motCleLower = motCle.toLowerCase();
  const motCleUpper = motCle.toUpperCase();

  return [
    { Section: section, Mot_Cle: motCle },
    { Section: sectionLower, Mot_Cle: motCleLower },
    { Section: sectionUpper, Mot_Cle: motCleUpper },
    { Section: sectionLower, Mot_Cle: motCleUpper },
    { Section: sectionUpper, Mot_Cle: motCleLower },
  ];
}

async function isGraphAuditEnabled() {
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: getCaseCandidates("dashboard", "audit_graph_openings"),
    },
    select: { Valeur: true },
  });

  return (setting?.Valeur ?? "false").toLowerCase() === "true";
}

export const POST = withAuthLogging(
  async (_req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const lieuId = Number.parseInt(id, 10);
      if (!Number.isFinite(lieuId)) {
        return apiError(400, "invalid_id", "Id de lieu invalide");
      }

      const enabled = await isGraphAuditEnabled();
      if (!enabled) {
        return apiOk({ logged: false, enabled: false });
      }

      const lieu = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: lieuId },
        select: { Id_Lieu: true, Nom_Lieu: true, Sonde_Numero_Serie: true },
      });

      if (!lieu) {
        return apiError(404, "not_found", "Lieu introuvable");
      }

      const { ip } = getRequestContext(_req);
      log.audit("GRPH", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip,
        lieuId: lieu.Id_Lieu,
        resource: `Graphique lieu ${lieu.Nom_Lieu ?? lieu.Id_Lieu}`,
        resourceId: lieu.Id_Lieu,
        changes: {
          sensor: lieu.Sonde_Numero_Serie ?? null,
          source: "monitoring-details",
        },
        success: true,
      });

      return apiOk({ logged: true, enabled: true });
    } catch (error) {
      log.error("lieux/graph-open", "graph_open_audit_failed", { error });
      return apiError(500, "graph_open_audit_failed", "Erreur lors de l'audit d'ouverture du graphique");
    }
  },
);
