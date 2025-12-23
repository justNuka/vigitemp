import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { createHash } from "node:crypto";

const unsubscribeSchema = z.object({
  endpoint: z.string().min(1),
});

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validated = unsubscribeSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const endpointHash = createHash("sha256")
    .update(validated.data.endpoint, "utf8")
    .digest("hex");

  const now = new Date();
  await prisma.t_push_subscription.updateMany({
    where: {
      Endpoint_Hash: endpointHash,
      Id_Utilisateur: user.userId,
    },
    data: {
      Est_Archive: true,
      Date_Modification: now,
    },
  });

  return NextResponse.json({ ok: true });
});
