import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat";
import { processPendingAlarmEmails } from "@/lib/alarm-email";
import { withLogging } from "@/lib/api-logger";

const payloadSchema = z.object({
  maxBatch: z.number().int().min(1).max(200).optional(),
});

function isAuthorized(req: NextRequest) {
  const secret = getCompatEnv("VIGISENSYS_ALARM_DISPATCH_SECRET", "VIGITEMP_ALARM_DISPATCH_SECRET");
  if (!secret) return false;
  return getCompatHeader(req, "x-vigisensys-secret", "x-vigitemp-secret") === secret;
}

export const POST = withLogging(async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return apiError(401, "unauthorized", "Non autorise");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, "invalid_payload", "Payload invalide");
  }

  const result = await processPendingAlarmEmails(parsed.data.maxBatch ?? 50);
  return apiOk(result);
});
