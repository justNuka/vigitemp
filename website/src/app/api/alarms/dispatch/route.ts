import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWebPushToActiveSubscriptions } from "@/lib/web-push";

const dispatchSchema = z.object({
  alarmId: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
});

function isAuthorized(req: NextRequest) {
  const secret = process.env.VIGITEMP_ALARM_DISPATCH_SECRET;
  if (!secret) return false;
  return req.headers.get("x-vigitemp-secret") === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const validated = dispatchSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  let title = validated.data.title;
  let messageBody = validated.data.body;
  let url = validated.data.url;
  const alarmId = validated.data.alarmId;

  if (alarmId && (!title || !messageBody || !url)) {
    const alarm = await prisma.t_alarme.findUnique({
      where: { Id_Alarme: alarmId },
      include: { t_lieu: { select: { Nom_Lieu: true } } },
    });
    if (alarm) {
      title ??= "Alarme Vigitemp";
      messageBody ??= `${alarm.t_lieu?.Nom_Lieu ?? "Lieu inconnu"} - ${
        alarm.Type === "H"
          ? "Alarme haute"
          : alarm.Type === "B"
          ? "Alarme basse"
          : "Alarme"
      } (${alarm.Valeur ?? "N/A"}${alarm.Unite ?? "°C"})`;
      url ??= "/dashboard/surveillance";
    }
  }

  title ??= "Alarme Vigitemp";
  messageBody ??= "Une alarme a été déclenchée.";
  url ??= "/dashboard/surveillance";

  const result = await sendWebPushToActiveSubscriptions({
    title,
    body: messageBody,
    data: { url, alarmId },
    tag: alarmId ? `alarm-${alarmId}` : "alarm",
  });

  return NextResponse.json({ ok: true, ...result });
}
