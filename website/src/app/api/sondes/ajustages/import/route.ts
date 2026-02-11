import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseAdjustmentXml } from "@/lib/adjustment-import";
import { expandRelatedGsoSerials, extractAddressFromSerial, isGsoType } from "@/lib/sensor-naming";

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

export const POST = async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) return apiError(401, "unauthenticated", "Non authentifie");

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError(400, "missing_file", "Fichier requis");
    }

    if (!isXmlFile(file)) {
      return apiError(415, "invalid_file", "Fichier XML requis");
    }

    const xml = await decodeXmlFile(file);
    const parsed = parseAdjustmentXml(xml, file.name);

    const serial = parsed.data.Sonde_Numero_Serie?.trim() ?? null;
    if (serial && isGsoType(serial)) {
      const relatedSerials = expandRelatedGsoSerials(serial);
      await prisma.t_sonde.createMany({
        data: relatedSerials.map((value) => ({
          Sonde_Numero_Serie: value,
          Adresse_Sonde: extractAddressFromSerial(value),
          Est_Sonde_GSO: true,
          Surveillance_Etat: "D",
          Sonde_Offset: 0,
        })),
        skipDuplicates: true,
      });
    }

    const created = await prisma.t_ajustage.create({
      data: parsed.data,
    });

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
    console.error("[POST /api/sondes/ajustages/import]", error);
    return apiError(500, "upload_failed", "Erreur lors de l'import");
  }
};
