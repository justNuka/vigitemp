import { NextRequest } from "next/server";
import { z } from "zod";

import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers";
import { apiError, apiOk } from "@/lib/api-response";
import { getRequestContext } from "@/lib/api-logger";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { requireStandardOrExpertLicense } from "@/lib/license-guards";

const patchSchema = z.object({
  dureeValiditeJours: z.number().int().positive().nullable(),
});

const computeDateValidite = (dateEtalonnage: Date | null, dureeValiditeJours: number | null) => {
  if (!dateEtalonnage || dureeValiditeJours === null) return null;
  const computed = new Date(dateEtalonnage);
  computed.setDate(computed.getDate() + dureeValiditeJours);
  return computed;
};

export const PATCH = withAuthLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const guard = await requireStandardOrExpertLicense();
      if (guard) return guard;

      const { id } = await params;
      const idEtalonnage = Number.parseInt(id, 10);
      if (!Number.isFinite(idEtalonnage)) {
        return apiError(400, "invalid_id", "Id d'etalonnage invalide");
      }

      const body = patchSchema.parse(await req.json());
      const { ip } = getRequestContext(req);

      const existing = await prisma.t_etalonnage.findUnique({
        where: { Id_Etalonnage: idEtalonnage },
        select: {
          Id_Etalonnage: true,
          Date_Heure_Etalonnage: true,
          Date_Validite: true,
          Duree_Validite_Jours: true,
          Sonde_Numero_Serie: true,
        },
      });

      if (!existing) {
        return apiError(404, "not_found", "Etalonnage introuvable");
      }

      const nextDateValidite = computeDateValidite(
        existing.Date_Heure_Etalonnage ?? null,
        body.dureeValiditeJours,
      );

      const updated = await prisma.t_etalonnage.update({
        where: { Id_Etalonnage: idEtalonnage },
        data: {
          Duree_Validite_Jours: body.dureeValiditeJours,
          Date_Validite: nextDateValidite,
        },
        select: {
          Id_Etalonnage: true,
          Date_Validite: true,
          Duree_Validite_Jours: true,
        },
      });

      log.audit("ET", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        resource: `Etalonnage:${idEtalonnage}`,
        changes: {
          Duree_Validite_Jours: {
            old: existing.Duree_Validite_Jours,
            new: body.dureeValiditeJours,
          },
          Date_Validite: {
            old: existing.Date_Validite,
            new: nextDateValidite,
          },
        },
        success: true,
      });

      return apiOk(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Valeur invalide", { issues: error.issues });
      }

      const message = error instanceof Error ? error.message : "Erreur lors de la mise a jour";
      log.error("sondes/etalonnages", "etalonnage_update_error", { error: error });
      return apiError(500, "update_failed", message);
    }
  },
);
