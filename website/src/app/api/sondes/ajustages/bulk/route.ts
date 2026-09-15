import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/api-logger";
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards";
import { log } from "@/lib/logger";
import { getPermissionAliases } from "@/lib/permissions";
import {
  buildImportedSensorStorageIdentity,
  extractProbeAddressFromSerial,
  resolveImportedSensorIdentity,
} from "@/lib/sensor-naming";
import { parseDbDateTime } from "@/lib/date-display";
import { readGspCoefficientsFromTarget } from "@/lib/metrology-gsp-coefficient-sync";
import {
  buildAdjustmentImportModuleAssignments,
  resolveEffectiveImportModuleId,
} from "@/lib/adjustment-import-module-assignment";

const rowSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  moduleId: z.number().int().positive().nullable().optional(),
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
  moduleId: z.number().int().positive().optional(),
  rows: z.array(rowSchema).min(1),
  confirmOverwrite: z.boolean().optional(),
});

const isMeaningfulOffset = (value: number | null | undefined) =>
  value !== null && value !== undefined && Math.abs(value) > 0.0000001;

export const POST = withOneOrHigherAnyAuthorizationLogging(getPermissionAliases("METROLOGY_OPERATION_ACCESS"), async (req: NextRequest, ctx) => {
  const { ip } = getRequestContext(req);

  try {
    const body = await req.json();
    const validated = bodySchema.parse(body);
    const legacyModuleId = validated.moduleId ?? null;

    log.info("ADJUSTMENT_IMPORT", "Bulk adjustment import requested", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      files: validated.rows.length,
      legacyModuleId,
    });

    const sensorTypes = await prisma.t_sonde_type.findMany({
      select: { Sonde_Type: true, Famille_Sonde: true },
    });
    const knownTypeCodes = sensorTypes
      .map((row) => row.Sonde_Type)
      .filter((row): row is string => Boolean(row));
    const familyByType = new Map(
      sensorTypes
        .filter((row): row is typeof row & { Sonde_Type: string } => Boolean(row.Sonde_Type))
        .map((row) => [row.Sonde_Type, row.Famille_Sonde]),
    );

    const normalizedRows = validated.rows.map((row) => {
      const sensorIdentity = row.insertData.Sonde_Numero_Serie
        ? resolveImportedSensorIdentity(row.insertData.Sonde_Numero_Serie, row.file, knownTypeCodes)
        : null;
      const storageIdentity = sensorIdentity
        ? buildImportedSensorStorageIdentity(sensorIdentity, knownTypeCodes)
        : null;
      return {
        ...row,
        requestedModuleId: row.moduleId === undefined ? legacyModuleId : row.moduleId,
        sensorTypeCode: sensorIdentity?.typeCode ?? null,
        sensorAddress: storageIdentity?.address ?? null,
        insertData: {
          ...row.insertData,
          Sonde_Numero_Serie: storageIdentity?.serial ?? null,
        },
      };
    });

    const serialTypeCodes = Array.from(
      new Set(
        normalizedRows
          .map((row) => row.sensorTypeCode)
          .filter((typeCode): typeCode is string => Boolean(typeCode)),
      ),
    );
    const unknownTypeCodes = serialTypeCodes.filter((typeCode) => !knownTypeCodes.includes(typeCode));
    if (unknownTypeCodes.length > 0) {
      return apiError(400, "invalid_sensor_type", "Type de sonde introuvable pour certaines sondes", {
        typeCodes: unknownTypeCodes,
      });
    }

    const duplicateFiles = normalizedRows
      .map((r) => r.file.trim().toLowerCase())
      .filter((name, index, arr) => arr.indexOf(name) !== index);

    if (duplicateFiles.length > 0) {
      log.warn("ADJUSTMENT_IMPORT", "Duplicate files in request payload", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        duplicates: duplicateFiles.length,
      });
      return apiError(409, "duplicate_files", "Des fichiers en double sont presents dans la liste");
    }

    const serials = Array.from(
      new Set(
        normalizedRows
          .map((row) => row.insertData.Sonde_Numero_Serie?.trim())
          .filter((serial): serial is string => !!serial),
      ),
    );
    const typeBySerial = new Map(
      normalizedRows
        .map((row) => [
          row.insertData.Sonde_Numero_Serie?.trim() ?? "",
          row.sensorTypeCode ?? "",
        ] as const)
        .filter(([serial, typeCode]) => serial.length > 0 && typeCode.length > 0),
    );
    const addressBySerial = new Map(
      normalizedRows
        .map((row) => [
          row.insertData.Sonde_Numero_Serie?.trim() ?? "",
          row.sensorAddress ?? "",
        ] as const)
        .filter(([serial, address]) => serial.length > 0 && address.length > 0),
    );
    const getSerialTypeCode = (serial: string) =>
      typeBySerial.get(serial) ?? resolveImportedSensorIdentity(serial, "", knownTypeCodes).typeCode;
    const isGsoSerial = (serial: string) => familyByType.get(getSerialTypeCode(serial)) === "GSO";

    const { assignments: requestedModuleBySerial, conflicts: moduleAssignmentConflicts } =
      buildAdjustmentImportModuleAssignments(
        normalizedRows.map((row) => ({
          sensorSerial: row.insertData.Sonde_Numero_Serie?.trim() ?? null,
          moduleId: row.requestedModuleId ?? null,
        })),
      );
    if (moduleAssignmentConflicts.length > 0) {
      return apiError(400, "conflicting_module_assignments", "Une même sonde ne peut pas être affectée à plusieurs modules pendant le même import", {
        sensors: moduleAssignmentConflicts,
      });
    }
    const requestedModuleIds = Array.from(
      new Set(Array.from(requestedModuleBySerial.values()).filter((id): id is number => id != null)),
    );

    const [sensorsWithOffset, requestedModules] = await Promise.all([
      serials.length > 0
        ? prisma.t_sonde.findMany({
            where: { Sonde_Numero_Serie: { in: serials } },
            select: {
              Id_Sonde: true,
              Sonde_Numero_Serie: true,
              Adresse_Sonde: true,
              Sonde_Offset: true,
              Id_Module: true,
            },
          })
        : Promise.resolve([]),
      requestedModuleIds.length > 0
        ? prisma.t_module.findMany({
            where: { Id_Module: { in: requestedModuleIds } },
            select: { Id_Module: true, Port_Serie: true, Module_Numero_Serie: true, Emplacement: true },
          })
        : Promise.resolve([]),
    ]);

    const requestedModuleIdSet = new Set(requestedModules.map((moduleRow) => moduleRow.Id_Module));
    const missingModuleIds = requestedModuleIds.filter((moduleId) => !requestedModuleIdSet.has(moduleId));
    if (missingModuleIds.length > 0) {
      return apiError(400, "invalid_module", "Un ou plusieurs modules sélectionnés sont introuvables", {
        moduleIds: missingModuleIds,
      });
    }

    const offsetRows = sensorsWithOffset.filter((sensor) => isMeaningfulOffset(sensor.Sonde_Offset));
    const offsetSerials = offsetRows
      .map((sensor) => sensor.Sonde_Numero_Serie)
      .filter((serial): serial is string => !!serial);
    const existingSensorsWithModule = sensorsWithOffset.filter(
      (sensor) => sensor.Id_Module !== null && sensor.Id_Module !== undefined,
    ).length;


    const existingSensorBySerial = new Map(
      sensorsWithOffset
        .filter((sensor) => sensor.Sonde_Numero_Serie)
        .map((sensor) => [sensor.Sonde_Numero_Serie as string, sensor]),
    );
    const existingModuleIds = Array.from(
      new Set(sensorsWithOffset.map((sensor) => sensor.Id_Module).filter((id): id is number => id != null)),
    );
    const additionalExistingModuleIds = existingModuleIds.filter((moduleId) => !requestedModuleIdSet.has(moduleId));
    const existingModules = additionalExistingModuleIds.length
      ? await prisma.t_module.findMany({
          where: { Id_Module: { in: additionalExistingModuleIds } },
          select: { Id_Module: true, Port_Serie: true, Module_Numero_Serie: true, Emplacement: true },
        })
      : [];
    const moduleById = new Map(
      [...requestedModules, ...existingModules].map((moduleRow) => [moduleRow.Id_Module, moduleRow]),
    );
    const liveGspCoefficients = new Map<string, Awaited<ReturnType<typeof readGspCoefficientsFromTarget>>>();
    const gspCoefficientFallbackSerials = new Set<string>();

    for (const serial of serials.filter((value) => !isGsoSerial(value))) {
      const existingSensor = existingSensorBySerial.get(serial);
      const requestedModuleId = requestedModuleBySerial.get(serial) ?? null;
      const effectiveModuleId = resolveEffectiveImportModuleId(existingSensor?.Id_Module, requestedModuleId);

      if (!effectiveModuleId) {
        gspCoefficientFallbackSerials.add(serial);
        log.info("ADJUSTMENT_IMPORT", "Skipping live GSP coefficient read because sensor has no module assignment", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          ip,
          serial,
        });
        continue;
      }

      const moduleRow = moduleById.get(effectiveModuleId) ?? null;
      const modulePort = moduleRow?.Port_Serie?.trim();
      if (!modulePort) {
        gspCoefficientFallbackSerials.add(serial);
        log.warn("ADJUSTMENT_IMPORT", "Skipping live GSP coefficient read because assigned module has no serial port", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          ip,
          serial,
          moduleId: effectiveModuleId,
        });
        continue;
      }

      try {
        const live = await readGspCoefficientsFromTarget({
          sensorId: existingSensor?.Id_Sonde ?? null,
          serialNumber: serial,
          address: existingSensor?.Adresse_Sonde?.trim() || addressBySerial.get(serial) || null,
          modulePort,
          moduleName: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
          unit: null,
        }, "AJUSTAGE");
        liveGspCoefficients.set(serial, live);
      } catch (error) {
        gspCoefficientFallbackSerials.add(serial);
        log.warn("ADJUSTMENT_IMPORT", "Live GSP coefficient read failed; imported XML coefficients will be used", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          ip,
          serial,
          moduleId: effectiveModuleId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (offsetSerials.length > 0 && !validated.confirmOverwrite) {
      log.warn("ADJUSTMENT_IMPORT", "Confirmation required before overwrite", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        sensorsWithAdjustment: 0,
        sensorsWithOffset: offsetSerials.length,
      });
      return apiError(409, "confirmation_required", "Confirmation requise avant insertion", {
        sensorsWithAdjustment: [],
        sensorsWithOffset: offsetRows,
      });
    }

    const existingSerialSet = new Set(
      sensorsWithOffset
        .map((sensor) => sensor.Sonde_Numero_Serie)
        .filter((serial): serial is string => Boolean(serial)),
    );

    const missingSerialsFromRows = serials.filter((serial) => !existingSerialSet.has(serial));
    const serialsToCreate = Array.from(new Set(missingSerialsFromRows));

    const insertedIds: string[] = [];
    const skippedIds: string[] = [];
    let overwrittenAdjustments = 0;
    const insertedSerials = new Set<string>();
    let invalidatedEtalonnages = 0;
    let invalidatedEtalonnageMeasures = 0;

    await prisma.$transaction(async (tx) => {
      for (const serial of serials) {
        const typeCode = getSerialTypeCode(serial);
        const gso = familyByType.get(typeCode) === "GSO";
        const requestedModuleId = requestedModuleBySerial.get(serial) ?? null;
        const requestedModule = requestedModuleId ? moduleById.get(requestedModuleId) ?? null : null;
        await tx.t_sonde.updateMany({
          where: { Sonde_Numero_Serie: serial },
          data: {
            Sonde_Type: typeCode,
            Est_Sonde_GSO: gso,
            ...(gso && addressBySerial.has(serial) ? { Adresse_Sonde: addressBySerial.get(serial) } : {}),
            ...(!existingSensorBySerial.get(serial)?.Id_Module && requestedModule
              ? { Id_Module: requestedModule.Id_Module, Port_Serie: requestedModule.Port_Serie }
              : {}),
          },
        });
      }

      if (serialsToCreate.length > 0) {
        const sensorsAlreadyPresentInTx = await tx.t_sonde.findMany({
          where: { Sonde_Numero_Serie: { in: serialsToCreate } },
          select: { Sonde_Numero_Serie: true },
        });

        const existingSerialsInTx = new Set(
          sensorsAlreadyPresentInTx
            .map((sensor) => sensor.Sonde_Numero_Serie)
            .filter((serial): serial is string => Boolean(serial)),
        );

        const serialsStillMissing = serialsToCreate.filter((serial) => !existingSerialsInTx.has(serial));

        if (serialsStillMissing.length > 0) {
          await tx.t_sonde.createMany({
            data: serialsStillMissing.map((serial) => {
              const gso = isGsoSerial(serial);
              const requestedModuleId = requestedModuleBySerial.get(serial) ?? null;
              const requestedModule = requestedModuleId ? moduleById.get(requestedModuleId) ?? null : null;
              return {
                Sonde_Numero_Serie: serial,
                Sonde_Type: getSerialTypeCode(serial),
                Adresse_Sonde:
                  addressBySerial.get(serial) ??
                  (gso ? serial : extractProbeAddressFromSerial(serial, knownTypeCodes)),
                Est_Sonde_GSO: gso,
                Surveillance_Etat: "D",
                Sonde_Offset: 0,
                Id_Module: requestedModule?.Id_Module ?? null,
                Port_Serie: requestedModule?.Port_Serie ?? null,
              };
            }),
          });
        }
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

      for (const row of normalizedRows) {
        const data = row.insertData;
        const dateAjustage = parseDbDateTime(data.Date_Heure_Ajustage);
        const dateCertif = parseDbDateTime(data.SE_Date_Certif);

        const live = data.Sonde_Numero_Serie ? liveGspCoefficients.get(data.Sonde_Numero_Serie) : null;
        const adjustmentData = {
            Date_Heure_Ajustage: dateAjustage,
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            Coeff_X2: live?.stored.coeffX2 ?? data.Coeff_X2 ?? 0,
            Coeff_X: live?.stored.coeffX ?? data.Coeff_X,
            Coeff_Constant: live?.stored.coeffConstant ?? data.Coeff_Constant,
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
          };

        const existing = await tx.t_ajustage.findFirst({
          where: {
            Sonde_Numero_Serie: data.Sonde_Numero_Serie,
            ...(dateAjustage ? { Date_Heure_Ajustage: dateAjustage } : {}),
          },
          orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
          select: { Id_Ajustage: true },
        });

        if (existing) {
          await tx.t_ajustage.update({ where: { Id_Ajustage: existing.Id_Ajustage }, data: adjustmentData });
          overwrittenAdjustments += 1;
        } else {
          await tx.t_ajustage.create({ data: adjustmentData });
        }

        if (data.Sonde_Numero_Serie) {
          insertedSerials.add(data.Sonde_Numero_Serie);
        }
        insertedIds.push(row.id);
      }

      const insertedSerialList = Array.from(insertedSerials);
      if (insertedSerialList.length > 0) {
        const etalonnagesToInvalidate = await tx.t_etalonnage.findMany({
          where: { Sonde_Numero_Serie: { in: insertedSerialList } },
          select: { Id_Etalonnage: true },
        });
        const etalonnageIds = etalonnagesToInvalidate.map((item) => item.Id_Etalonnage);

        if (etalonnageIds.length > 0) {
          const deletedMeasures = await tx.t_etalonnage_mesure.deleteMany({
            where: { Id_Etalonnage: { in: etalonnageIds } },
          });
          const deletedEtalonnages = await tx.t_etalonnage.deleteMany({
            where: { Id_Etalonnage: { in: etalonnageIds } },
          });

          invalidatedEtalonnageMeasures = deletedMeasures.count;
          invalidatedEtalonnages = deletedEtalonnages.count;
        }
      }
    });

    log.info("ADJUSTMENT_IMPORT", "Bulk adjustment import completed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      inserted: insertedIds.length,
      skipped: skippedIds.length,
      createdSensorsFromAdjustment: serialsToCreate.length,
      invalidatedEtalonnages,
      invalidatedEtalonnageMeasures,
      gspCoefficientFallbackCount: gspCoefficientFallbackSerials.size,
      gspCoefficientFallbackSerials: Array.from(gspCoefficientFallbackSerials).slice(0, 20),
    })

    log.audit("CA", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Import ajustage",
      changes: {
        files: validated.rows.length,
        inserted: insertedIds.length,
        skipped: skippedIds.length,
        createdSensorsFromAdjustment: serialsToCreate.length,
        overwrittenAdjustments,
        clearedOffsets: validated.confirmOverwrite ? offsetSerials.length : 0,
        invalidatedEtalonnages,
        invalidatedEtalonnageMeasures,
        gspCoefficientFallbackCount: gspCoefficientFallbackSerials.size,
        gspCoefficientFallbackSerials: Array.from(gspCoefficientFallbackSerials).slice(0, 20),
        serials: serials.slice(0, 10),
        fileNames: validated.rows.slice(0, 10).map((row) => row.file),
      },
      success: true,
    });

    return apiOk({
      inserted: insertedIds.length,
      skipped: skippedIds.length,
      insertedIds,
      skippedIds,
      overwrittenAdjustments,
      clearedOffsets: validated.confirmOverwrite ? offsetSerials.length : 0,
      createdSensorsFromAdjustment: serialsToCreate.length,
      existingSensorsWithModule,
      invalidatedEtalonnages,
      invalidatedEtalonnageMeasures,
      gspCoefficientFallbackCount: gspCoefficientFallbackSerials.size,
      gspCoefficientFallbackSerials: Array.from(gspCoefficientFallbackSerials),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn("ADJUSTMENT_IMPORT", "Validation error on bulk import", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip,
        issues: error.issues.length,
      });
      return apiError(400, "validation_error", "Donnees invalides", { issues: error.issues });
    }

    log.error("ADJUSTMENT_IMPORT", "Bulk adjustment import failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
    log.audit("CA", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Import ajustage",
      success: false,
      reason: error instanceof Error ? error.message : "Erreur inconnue",
    });

    return apiError(500, "bulk_import_failed", "Erreur lors de l'insertion en base");
  }
});

