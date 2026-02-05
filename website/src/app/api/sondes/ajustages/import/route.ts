import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { apiError, apiOk } from "@/lib/api-response";

const isXmlFile = (file: File) => {
  const name = file.name.toLowerCase();
  const hasXmlExtension = name.endsWith(".xml");
  const isXmlType =
    file.type === "application/xml" || file.type === "text/xml" || file.type === "";
  return hasXmlExtension || isXmlType;
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

    return apiOk({
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[POST /api/sondes/ajustages/import]", error);
    return apiError(500, "upload_failed", "Erreur lors de l'import");
  }
};
