import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const measureSchema = z.object({
  Numero_Ordre: z.number().int().min(1).max(10),
  Mesure_Sonde: z.number().nullable(),
  Mesure_Etalon: z.number().nullable(),
});

const rowSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  insertData: z.object({
    Date_Heure_Etalonnage: z.string().nullable(),
    Sonde_Numero_Serie: z.string().nullable(),
    Date_Validite: z.string().nullable(),
    Operateur: z.string().nullable(),
    Etalon_Numero_Serie: z.string().nullable(),
    Date_Certif: z.string().nullable(),
    Organisme: z.string().nullable(),
    Num_Certif: z.string().nullable(),
    Unite: z.string().nullable(),
    Incertitude: z.string().nullable(),
    Moyenne_Etalon: z.number().nullable(),
    Moyenne_Sonde: z.number().nullable(),
    Repetabilite: z.string().nullable(),
    Err_Justesse: z.string().nullable(),    Mesures: z.array(measureSchema).optional().default([]),
  }),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1),
});

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

    const insertedIds: string[] = [];
    const skippedIds: string[] = [];

    const serials = Array.from(
      new Set(
        validated.rows
          .map((row) => row.insertData.Sonde_Numero_Serie?.trim())
          .filter((serial): serial is string => !!serial),
      ),
    );

    await prisma.$transaction(async (tx) => {
      if (serials.length > 0) {
        await tx.t_lieu.updateMany({
          where: { Sonde_Numero_Serie: { in: serials } },
          data: { Infos_Modifiees_Depuis_Derniere_Mesure: true },
        });
      }

      for (const row of validated.rows) {
        const data = row.insertData;
        const dateEtalonnage = data.Date_Heure_Etalonnage ? new Date(data.Date_Heure_Etalonnage) : null;
        const dateValidite = data.Date_Validite ? new Date(data.Date_Validite) : null;
        const dateCertif = data.Date_Certif ? new Date(data.Date_Certif) : null;

        const existing = await tx.t_etalonnage.findFirst({
          where: {
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            Date_Heure_Etalonnage: dateEtalonnage,
            Num_Certif: data.Num_Certif,
          },
          select: { Id_Etalonnage: true },
        });

        if (existing) {
          skippedIds.push(row.id);
          continue;
        }

        const created = await tx.t_etalonnage.create({
          data: {
            Date_Heure_Etalonnage: dateEtalonnage,
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            Date_Validite: dateValidite,
            Operateur: data.Operateur,
            Etalon_Numero_Serie: data.Etalon_Numero_Serie,
            Date_Certif: dateCertif,
            Organisme: data.Organisme,
            Num_Certif: data.Num_Certif,
            Unite: data.Unite,
            Incertitude: data.Incertitude,
            Moyenne_Etalon: data.Moyenne_Etalon,
            Moyenne_Sonde: data.Moyenne_Sonde,
            Repetabilite: data.Repetabilite,
            Err_Justesse: data.Err_Justesse,          },
          select: { Id_Etalonnage: true },
        });

        const uniqueMeasures = new Map<number, { Mesure_Sonde: number | null; Mesure_Etalon: number | null }>();
        for (const m of data.Mesures) {
          uniqueMeasures.set(m.Numero_Ordre, {
            Mesure_Sonde: m.Mesure_Sonde,
            Mesure_Etalon: m.Mesure_Etalon,
          });
        }

        for (const [numeroOrdre, measure] of uniqueMeasures) {
          if (measure.Mesure_Etalon === null && measure.Mesure_Sonde === null) continue;

          await tx.t_etalonnage_mesure.create({
            data: {
              Id_Etalonnage: created.Id_Etalonnage,
              Numero_Ordre: numeroOrdre,
              Mesure_Sonde: measure.Mesure_Sonde,
              Mesure_Etalon: measure.Mesure_Etalon,
            },
          });
        }

        insertedIds.push(row.id);
      }
    });

    return apiOk({
      inserted: insertedIds.length,
      skipped: skippedIds.length,
      insertedIds,
      skippedIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { issues: error.issues });
    }

    const message = error instanceof Error ? error.message : "Erreur lors de l'insertion en base";
    console.error("[POST /api/sondes/etalonnages/bulk]", error);
    return apiError(500, "bulk_import_failed", message);
  }
};

