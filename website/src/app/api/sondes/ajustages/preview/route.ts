import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { getRequestContext } from "@/lib/api-logger";
import { parseAdjustmentXml } from "@/lib/adjustment-import";
import { log } from "@/lib/logger";

const isXmlFile = (file: File) => {
  const name = file.name.toLowerCase();
  const hasXmlExtension = name.endsWith(".xml");
  const isXmlType =
    file.type === "application/xml" || file.type === "text/xml" || file.type === "";
  return hasXmlExtension || isXmlType;
};

const detectDeclaredEncoding = (buffer: Buffer) => {
  const head = buffer.subarray(0, 512).toString("ascii");
  const match = head.match(/encoding\s*=\s*["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? null;
};

const countOccurrences = (value: string, needle: string) =>
  needle.length === 0 ? 0 : value.split(needle).length - 1;

const mojibakeScore = (value: string) => {
  const replacementChar = String.fromCharCode(0xfffd);
  const badDegree = String.fromCharCode(0x00c2, 0x00b0);
  const badLegacy = String.fromCharCode(0x00ef, 0x00bf, 0x00bd);
  const badAccentPrefix = String.fromCharCode(0x00c3);

  const replacement = countOccurrences(value, replacementChar);
  const degree = countOccurrences(value, badDegree);
  const legacy = countOccurrences(value, badLegacy);
  const accent = countOccurrences(value, badAccentPrefix);

  return replacement * 4 + legacy * 4 + degree * 3 + accent * 2;
};

const decodeXmlFile = async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const declaredEncoding = detectDeclaredEncoding(buffer);

  const utf8 = buffer.toString("utf8");
  const latin1 = buffer.toString("latin1");

  let utf8Score = mojibakeScore(utf8);
  let latin1Score = mojibakeScore(latin1);

  if (declaredEncoding?.includes("utf")) utf8Score -= 0.5;
  if (declaredEncoding?.includes("8859-1") || declaredEncoding?.includes("latin1")) latin1Score -= 0.5;

  return utf8Score <= latin1Score ? utf8 : latin1;
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
    const formData = await req.formData();
    const file = formData.get("file");

    log.info("ADJUSTMENT_PREVIEW", "Ajustage preview requested", {
      user: user.username,
      userId: user.userId,
      ip,
      hasFile: file instanceof File,
    })

    if (!file || !(file instanceof File)) {
      log.warn("ADJUSTMENT_PREVIEW", "Ajustage preview rejected: missing file", {
        user: user.username,
        userId: user.userId,
        ip,
      })
      return apiError(400, "missing_file", "Fichier requis");
    }

    if (!isXmlFile(file)) {
      log.warn("ADJUSTMENT_PREVIEW", "Ajustage preview rejected: invalid file type", {
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

    log.info("ADJUSTMENT_PREVIEW", "Ajustage preview parsed", {
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
      date: parsed.summary.date,
      dateText: parsed.summary.dateText,
      operator: parsed.summary.operator,
      coeffX: parsed.summary.coeffX,
      coeffConstant: parsed.summary.coeffConstant,
      measureEtalon1: parsed.summary.measureEtalon1,
      measureEtalon2: parsed.summary.measureEtalon2,
      unit: parsed.summary.unit,
      warnings: parsed.warnings,
      insertData: {
        Date_Heure_Ajustage: toIso(parsed.data.Date_Heure_Ajustage ?? null),
        Sonde_Numero_Serie: parsed.data.Sonde_Numero_Serie ?? null,
        Coeff_X2: parsed.data.Coeff_X2 ?? 0,
        Coeff_X: parsed.data.Coeff_X ?? null,
        Coeff_Constant: parsed.data.Coeff_Constant ?? null,
        Unite: parsed.data.Unite ?? null,
        Nb_Decimale: parsed.data.Nb_Decimale ?? null,
        Operateur: parsed.data.Operateur ?? null,
        SE_Numero: parsed.data.SE_Numero ?? null,
        SE_Organisme: parsed.data.SE_Organisme ?? null,
        SE_Date_Certif: toIso(parsed.data.SE_Date_Certif ?? null),
        SE_Numero_Certif: parsed.data.SE_Numero_Certif ?? null,
        Mesure_Etalon1: parsed.data.Mesure_Etalon1 ?? null,
        Mesure_Etalon2: parsed.data.Mesure_Etalon2 ?? null,
        Valeur_Brute1: parsed.data.Valeur_Brute1 ?? null,
        Valeur_Brute2: parsed.data.Valeur_Brute2 ?? null,
        Ancienne_Mesure1: parsed.data.Ancienne_Mesure1 ?? null,
        Ancienne_Mesure2: parsed.data.Ancienne_Mesure2 ?? null,
        Nouvelle_Mesure1: parsed.data.Nouvelle_Mesure1 ?? null,
        Nouvelle_Mesure2: parsed.data.Nouvelle_Mesure2 ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log.error("ADJUSTMENT_PREVIEW", "Ajustage preview failed", {
      user: user.username,
      userId: user.userId,
      ip,
      error: message,
    })
    console.error("[POST /api/sondes/ajustages/preview]", error);
    return apiError(500, "preview_failed", "Erreur lors de la preparation");
  }
};
