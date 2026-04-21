import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { getRequestContext } from "@/lib/api-logger";
import { prisma } from "@/lib/prisma";
import { parseAdjustmentXml } from "@/lib/adjustment-import";
import { log } from "@/lib/logger";
import { decodeXmlBytes } from "@/lib/xml-decoding";
import { extractProbeAddressFromSerial, extractTypeCodeFromSerial } from "@/lib/sensor-naming";

const isXmlFile = (file: File) => {
  const name = file.name.toLowerCase();
  const hasXmlExtension = name.endsWith(".xml");
  const isXmlType =
    file.type === "application/xml" || file.type === "text/xml" || file.type === "";
  return hasXmlExtension || isXmlType;
};

const decodeXmlFile = async (file: File) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return decodeXmlBytes(bytes).text;
};

export const POST = async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return apiError(401, "unauthenticated", "Non authentifie");

  const { ip } = getRequestContext(req)

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    log.info("ADJUSTMENT_IMPORT_SINGLE", "Ajustage import request received", {
      user: user.username,
      userId: user.userId,
      ip,
      hasFile: file instanceof File,
    })

    if (!file || !(file instanceof File)) {
      log.warn("ADJUSTMENT_IMPORT_SINGLE", "Ajustage import rejected: missing file", {
        user: user.username,
        userId: user.userId,
        ip,
      })
      return apiError(400, "missing_file", "Fichier requis");
    }

    if (!isXmlFile(file)) {
      log.warn("ADJUSTMENT_IMPORT_SINGLE", "Ajustage import rejected: invalid file type", {
        user: user.username,
        userId: user.userId,
        ip,
        fileName: file.name,
        mimeType: file.type,
      })
      return apiError(415, "invalid_file", "Fichier XML requis");
    }

    const xml = await decodeXmlFile(file);
    const parsed = parseAdjustmentXml(xml, file.name);

    const serial = parsed.data.Sonde_Numero_Serie?.trim() ?? null;
    if (serial) {
      const sensorTypes = await prisma.t_sonde_type.findMany({
        select: { Sonde_Type: true, Famille_Sonde: true },
      });
      const knownTypeCodes = sensorTypes
        .map((row) => row.Sonde_Type)
        .filter((row): row is string => Boolean(row));
      const typeCode = extractTypeCodeFromSerial(serial, knownTypeCodes);
      const sensorType = sensorTypes.find((row) => row.Sonde_Type === typeCode) ?? null;
      const isGsoFamily = sensorType?.Famille_Sonde === "GSO";

      await prisma.t_sonde.createMany({
        data: [{
          Sonde_Numero_Serie: serial,
          Sonde_Type: sensorType?.Sonde_Type ?? typeCode,
          Adresse_Sonde: extractProbeAddressFromSerial(serial, knownTypeCodes),
          Est_Sonde_GSO: isGsoFamily,
          Surveillance_Etat: "D",
          Sonde_Offset: 0,
        }],
        skipDuplicates: true,
      });

      await prisma.t_sonde.updateMany({
        where: { Sonde_Numero_Serie: serial },
        data: {
          Sonde_Type: sensorType?.Sonde_Type ?? typeCode,
          Est_Sonde_GSO: isGsoFamily,
        },
      });
    }

    const created = await prisma.t_ajustage.create({
      data: parsed.data,
    });

    log.info("ADJUSTMENT_IMPORT_SINGLE", "Ajustage import inserted", {
      user: user.username,
      userId: user.userId,
      ip,
      fileName: file.name,
      idAjustage: created.Id_Ajustage,
      sonde: parsed.summary.sensor,
      date: parsed.summary.date,
      warnings: parsed.warnings.length,
    })

    log.audit("CA", {
      user: user.username,
      userId: user.userId,
      ip,
      resource: "Import ajustage (unitaire)",
      resourceId: created.Id_Ajustage,
      changes: {
        fileName: file.name,
        sonde: parsed.summary.sensor,
        date: parsed.summary.date,
        operator: parsed.summary.operator,
        coeffX: parsed.summary.coeffX,
        coeffConstant: parsed.summary.coeffConstant,
        warnings: parsed.warnings,
      },
      success: true,
    })

    return apiOk({
      id: created.Id_Ajustage,
      file: file.name,
      sensor: parsed.summary.sensor,
      date: parsed.summary.date,
      dateText: parsed.summary.dateText,
      operator: parsed.summary.operator,
      coeffX: parsed.summary.coeffX,
      coeffConstant: parsed.summary.coeffConstant,
      measureEtalon1: parsed.summary.measureEtalon1,
      measureEtalon2: parsed.summary.measureEtalon2,
      unit: parsed.summary.unit,
      warnings: parsed.warnings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log.error("ADJUSTMENT_IMPORT_SINGLE", "Ajustage import failed", {
      user: user.username,
      userId: user.userId,
      ip,
      error: message,
    })
    log.audit("CA", {
      user: user.username,
      userId: user.userId,
      ip,
      resource: "Import ajustage (unitaire)",
      success: false,
      reason: message,
    })
    return apiError(500, "upload_failed", "Erreur lors de l'import");
  }
};
