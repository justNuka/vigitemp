import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const rowSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  insertData: z.object({
    Date_Heure_Ajustage: z.string().nullable(),
    Sonde_Numero_Serie: z.string().nullable(),
    Coeff_X2: z.number().nullable(),
    Coeff_X: z.number().nullable(),
    Coeff_Constant: z.number().nullable(),
    Unite: z.string().nullable(),
    Nb_Decimale: z.number().nullable(),
    Operateur: z.string().nullable(),
    SE_Numero: z.string().nullable(),
    SE_Organisme: z.string().nullable(),
    SE_Date_Certif: z.string().nullable(),
    SE_Numero_Certif: z.string().nullable(),
    Mesure_Etalon1: z.number().nullable(),
    Mesure_Etalon2: z.number().nullable(),
    Valeur_Brute1: z.number().nullable(),
    Valeur_Brute2: z.number().nullable(),
    Ancienne_Mesure1: z.number().nullable(),
    Ancienne_Mesure2: z.number().nullable(),
    Nouvelle_Mesure1: z.number().nullable(),
    Nouvelle_Mesure2: z.number().nullable(),
  }),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1),
  confirmOverwrite: z.boolean().optional(),
});

const isMeaningfulOffset = (value: number | null | undefined) =>
  value !== null && value !== undefined && Math.abs(value) > 0.0000001;

export const POST = async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return apiError(401, "unauthenticated", "Non authentifie");

  try {
    const body = await req.json();
    const validated = bodySchema.parse(body);

    const duplicateFiles = validated.rows
      .map((r) => r.file.trim().toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);

    if (duplicateFiles.length > 0) {
      return apiError(409, "duplicate_files", "Des fichiers en double sont presents dans la liste");
    }

    const serials = Array.from(
      new Set(
        validated.rows
          .map((row) => row.insertData.Sonde_Numero_Serie?.trim())
          .filter((serial): serial is string => !!serial),
      ),
    );

    const [existingAdjustments, sensorsWithOffset] = await Promise.all([
      serials.length > 0
        ? prisma.t_ajustage.groupBy({
            by: ["Sonde_Numero_Serie"],
            where: { Sonde_Numero_Serie: { in: serials } },
          })
        : Promise.resolve([]),
      serials.length > 0
        ? prisma.t_sonde.findMany({
            where: { Sonde_Numero_Serie: { in: serials } },
            select: { Sonde_Numero_Serie: true, Sonde_Offset: true },
          })
        : Promise.resolve([]),
    ]);

    const adjustmentSerials = existingAdjustments
      .map((entry) => entry.Sonde_Numero_Serie)
      .filter((serial): serial is string => !!serial);

    const offsetRows = sensorsWithOffset.filter((sensor) => isMeaningfulOffset(sensor.Sonde_Offset));
    const offsetSerials = offsetRows
      .map((sensor) => sensor.Sonde_Numero_Serie)
      .filter((serial): serial is string => !!serial);

    if ((adjustmentSerials.length > 0 || offsetSerials.length > 0) && !validated.confirmOverwrite) {
      return apiError(409, "confirmation_required", "Confirmation requise avant insertion", {
        sensorsWithAdjustment: adjustmentSerials,
        sensorsWithOffset: offsetRows,
      });
    }

    const insertedIds: string[] = [];
    const skippedIds: string[] = [];

    await prisma.$transaction(async (tx) => {
      if (validated.confirmOverwrite && adjustmentSerials.length > 0) {
        await tx.t_ajustage.deleteMany({
          where: { Sonde_Numero_Serie: { in: adjustmentSerials } },
        });
      }

      if (validated.confirmOverwrite && offsetSerials.length > 0) {
        await tx.t_sonde.updateMany({
          where: { Sonde_Numero_Serie: { in: offsetSerials } },
          data: { Sonde_Offset: 0 },
        });
      }

      if (serials.length > 0) {
        await tx.t_lieu.updateMany({
          where: { Sonde_Numero_Serie: { in: serials } },
          data: { Infos_Modifiees_Depuis_Derniere_Mesure: true },
        });
      }

      for (const row of validated.rows) {
        const data = row.insertData;
        const dateAjustage = data.Date_Heure_Ajustage ? new Date(data.Date_Heure_Ajustage) : null;
        const dateCertif = data.SE_Date_Certif ? new Date(data.SE_Date_Certif) : null;

        const existing = await tx.t_ajustage.findFirst({
          where: {
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            Date_Heure_Ajustage: dateAjustage,
            Coeff_X: data.Coeff_X,
            Coeff_Constant: data.Coeff_Constant,
            Mesure_Etalon1: data.Mesure_Etalon1,
            Mesure_Etalon2: data.Mesure_Etalon2,
          },
          select: { Id_Ajustage: true },
        });

        if (existing) {
          skippedIds.push(row.id);
          continue;
        }

        await tx.t_ajustage.create({
          data: {
            Date_Heure_Ajustage: dateAjustage,
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            Coeff_X2: data.Coeff_X2 ?? 0,
            Coeff_X: data.Coeff_X,
            Coeff_Constant: data.Coeff_Constant,
            Unite: data.Unite,
            Nb_Decimale: data.Nb_Decimale,
            Operateur: data.Operateur,
            SE_Numero: data.SE_Numero,
            SE_Organisme: data.SE_Organisme,
            SE_Date_Certif: dateCertif,
            SE_Numero_Certif: data.SE_Numero_Certif,
            Mesure_Etalon1: data.Mesure_Etalon1,
            Mesure_Etalon2: data.Mesure_Etalon2,
            Valeur_Brute1: data.Valeur_Brute1,
            Valeur_Brute2: data.Valeur_Brute2,
            Ancienne_Mesure1: data.Ancienne_Mesure1,
            Ancienne_Mesure2: data.Ancienne_Mesure2,
            Nouvelle_Mesure1: data.Nouvelle_Mesure1,
            Nouvelle_Mesure2: data.Nouvelle_Mesure2,
          },
        });

        insertedIds.push(row.id);
      }
    });

    return apiOk({
      inserted: insertedIds.length,
      skipped: skippedIds.length,
      insertedIds,
      skippedIds,
      overwrittenAdjustments: validated.confirmOverwrite ? adjustmentSerials.length : 0,
      clearedOffsets: validated.confirmOverwrite ? offsetSerials.length : 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { issues: error.issues });
    }
    console.error("[POST /api/sondes/ajustages/bulk]", error);
    return apiError(500, "bulk_import_failed", "Erreur lors de l'insertion en base");
  }
};

