import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/api-logger";
import { withAuthLogging } from "@/lib/api-wrappers";
import { log } from "@/lib/logger";
import { requireStandardOrExpertLicense } from "@/lib/license-guards";

const measureSchema = z.object({
  Numero_Ordre: z.number().int().min(1).max(10),
  Mesure_Sonde: z.number().nullable(),
  Mesure_Etalon: z.number().nullable(),
});

const nullableNumericTextSchema = z.union([z.string(), z.number()]).nullable();

const rowSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  calibrationName: z.string().max(255).nullable().optional(),
  insertData: z.object({
    Date_Heure_Etalonnage: z.string().nullable(),
    Sonde_Numero_Serie: z.string().nullable(),
    Date_Validite: z.string().nullable(),
    Duree_Validite_Jours: z.number().int().positive().nullable().optional(),
    Operateur: z.string().nullable(),
    Etalon_Numero_Serie: z.string().nullable(),
    Date_Certif: z.string().nullable(),
    Organisme: z.string().nullable(),
    Num_Certif: z.string().nullable(),
    Unite: z.string().nullable(),
    Incertitude: nullableNumericTextSchema,
    Moyenne_Etalon: z.number().nullable(),
    Moyenne_Sonde: z.number().nullable(),
    Repetabilite: nullableNumericTextSchema,
    Err_Justesse: nullableNumericTextSchema,
    Mesures: z.array(measureSchema).optional().default([]),
  }),
});

const parseNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNullableText = (value: string | number | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};


const computeDateValidite = (dateEtalonnage: Date | null, dateValidite: Date | null, dureeValiditeJours: number | null) => {
  if (dureeValiditeJours !== null && dateEtalonnage) {
    const computed = new Date(dateEtalonnage);
    computed.setDate(computed.getDate() + dureeValiditeJours);
    return computed;
  }
  return dateValidite;
};

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1),
});

export const POST = withAuthLogging(async (req: NextRequest, ctx) => {
  const { ip } = getRequestContext(req);

  try {
    const guard = await requireStandardOrExpertLicense();
    if (guard) return guard;

    const body = await req.json();
    const validated = bodySchema.parse(body);

    log.info("CALIBRATION_CHECK_IMPORT", "Bulk etalonnage import requested", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      files: validated.rows.length,
      namedCalibrations: validated.rows.filter((row) => !!row.calibrationName?.trim()).length,
    });

    const duplicateFiles = validated.rows
      .map((r) => r.file.trim().toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);

    if (duplicateFiles.length > 0) {
      log.warn("CALIBRATION_CHECK_IMPORT", "Duplicate files in request payload", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        duplicates: duplicateFiles.length,
      });
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
        const dureeValiditeJours = data.Duree_Validite_Jours ?? null;
        const dateValiditeFinale = computeDateValidite(dateEtalonnage, dateValidite, dureeValiditeJours);

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
            Date_Validite: dateValiditeFinale,
            Duree_Validite_Jours: dureeValiditeJours,
            Valide: new Date(),
            Operateur: data.Operateur,
            Etalon_Numero_Serie: data.Etalon_Numero_Serie,
            Date_Certif: dateCertif,
            Organisme: data.Organisme,
            Num_Certif: data.Num_Certif,
            Unite: data.Unite,
            Incertitude: parseNullableNumber(data.Incertitude),
            Moyenne_Etalon: data.Moyenne_Etalon,
            Moyenne_Sonde: data.Moyenne_Sonde,
            Repetabilite: toNullableText(data.Repetabilite),
            Err_Justesse: parseNullableNumber(data.Err_Justesse),
          },
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

    log.audit("ET", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Import etalonnage",
      changes: {
        files: validated.rows.length,
        inserted: insertedIds.length,
        skipped: skippedIds.length,
        serials: serials.slice(0, 10),
        fileNames: validated.rows.slice(0, 10).map((row) => row.file),
        calibrationNames: validated.rows
          .map((row) => row.calibrationName?.trim() || null)
          .filter((name): name is string => !!name)
          .slice(0, 10),
      },
      success: true,
    });

    return apiOk({
      inserted: insertedIds.length,
      skipped: skippedIds.length,
      insertedIds,
      skippedIds,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn("CALIBRATION_CHECK_IMPORT", "Validation error on bulk import", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        issues: error.issues.length,
        firstIssues: error.issues.slice(0, 5).map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return apiError(400, "validation_error", "Donnees invalides", { issues: error.issues });
    }

    const message = error instanceof Error ? error.message : "Erreur lors de l'insertion en base";
    log.error("CALIBRATION_CHECK_IMPORT", "Bulk etalonnage import failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: message,
    });
    log.audit("ET", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Import etalonnage",
      success: false,
      reason: message,
    });
    return apiError(500, "bulk_import_failed", message);
  }
});

