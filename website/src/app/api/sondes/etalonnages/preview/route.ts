import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { getRequestContext } from "@/lib/api-logger";
import { parseCalibrationXml } from "@/lib/calibration-import";
import { log } from "@/lib/logger";
import { decodeXmlBytes } from "@/lib/xml-decoding";
import { requireStandardOrExpertLicense } from "@/lib/license-guards";

const isXmlFile = (file: File) => {
  const name = file.name.toLowerCase();
  const hasXmlExtension = name.endsWith(".xml");
  const isXmlType = file.type === "application/xml" || file.type === "text/xml" || file.type === "";
  return hasXmlExtension || isXmlType;
};

const decodeXmlFile = async (file: File) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return decodeXmlBytes(bytes).text;
};

const toIso = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export const POST = async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return apiError(401, "unauthenticated", "Non authentifie");

  const { ip } = getRequestContext(req)

  try {
    const guard = await requireStandardOrExpertLicense();
    if (guard) return guard;

    const formData = await req.formData();
    const file = formData.get("file");

    log.info("CALIBRATION_PREVIEW", "Etalonnage preview requested", {
      user: user.username,
      userId: user.userId,
      ip,
      hasFile: file instanceof File,
    })

    if (!file || !(file instanceof File)) {
      log.warn("CALIBRATION_PREVIEW", "Etalonnage preview rejected: missing file", {
        user: user.username,
        userId: user.userId,
        ip,
      })
      return apiError(400, "missing_file", "Fichier requis");
    }

    if (!isXmlFile(file)) {
      log.warn("CALIBRATION_PREVIEW", "Etalonnage preview rejected: invalid file type", {
        user: user.username,
        userId: user.userId,
        ip,
        fileName: file.name,
        mimeType: file.type,
      })
      return apiError(415, "invalid_file", "Fichier XML requis");
    }

    const xml = await decodeXmlFile(file);
    const parsed = parseCalibrationXml(xml, file.name);

    log.info("CALIBRATION_PREVIEW", "Etalonnage preview parsed", {
      user: user.username,
      userId: user.userId,
      ip,
      fileName: file.name,
      sonde: parsed.summary.sensor,
      date: parsed.summary.date,
      warnings: parsed.warnings.length,
    })

    return apiOk({
      id: randomUUID(),
      file: file.name,
      sensor: parsed.summary.sensor,
      calibrationName: parsed.summary.calibrationName,
      date: parsed.summary.date,
      dateText: parsed.summary.dateText,
      dateValidity: parsed.summary.dateValidity,
      dateValidityText: parsed.summary.dateValidityText,
      operator: parsed.summary.operator,
      uncertainty: parsed.summary.uncertainty,
      unit: parsed.summary.unit,
      warnings: parsed.warnings,
      insertData: {
        Date_Heure_Etalonnage: toIso(parsed.data.Date_Heure_Etalonnage ?? null),
        Sonde_Numero_Serie: parsed.data.Sonde_Numero_Serie ?? null,
        Date_Validite: toIso(parsed.data.Date_Validite ?? null),
        Duree_Validite_Jours: parsed.data.Duree_Validite_Jours ?? null,
        Operateur: parsed.data.Operateur ?? null,
        Etalon_Numero_Serie: parsed.data.Etalon_Numero_Serie ?? null,
        Date_Certif: toIso(parsed.data.Date_Certif ?? null),
        Organisme: parsed.data.Organisme ?? null,
        Num_Certif: parsed.data.Num_Certif ?? null,
        Unite: parsed.data.Unite ?? null,
        Incertitude: parsed.data.Incertitude ?? null,
        Moyenne_Etalon: parsed.data.Moyenne_Etalon ?? null,
        Moyenne_Sonde: parsed.data.Moyenne_Sonde ?? null,
        Repetabilite: parsed.data.Repetabilite ?? null,
        Err_Justesse: parsed.data.Err_Justesse ?? null,        Mesures: parsed.measures,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log.error("CALIBRATION_PREVIEW", "Etalonnage preview failed", {
      user: user.username,
      userId: user.userId,
      ip,
      error: message,
    })
    return apiError(500, "preview_failed", "Erreur lors de la preparation");
  }
};

