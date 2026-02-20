import { prisma, prismaMesure } from "@/lib/prisma";
import { isEmailEnabled, sendEmail, type EmailAttachment } from "@/lib/email";
import { log } from "@/lib/logger";
import AlarmEventNotificationEmail from "../../emails/alarm-event-notification";
import { PNG } from "pngjs";

export type AlarmEmailEventType = "triggered" | "ended" | "acknowledged";

type SendAlarmEventEmailInput = {
  eventType: AlarmEmailEventType;
  alarmId?: number | null;
  site?: string | null;
  lieu: string;
  sonde?: string | null;
  alarmTypeCode?: string | null;
  triggeredAt?: Date | null;
  endedAt?: Date | null;
  acknowledgedAt?: Date | null;
  acknowledgedBy?: string | null;
  lastValue?: string | null;
  details?: string | null;
  alarmUrl?: string | null;
  idLieu?: number | null;
  unite?: string | null;
  consigneSup?: number | null;
  consigneInf?: number | null;
  consigne?: number | null;
};

async function isAlarmEmailNotificationEnabled() {
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: "notifications", Mot_Cle: "email" },
        { Section: "NOTIFICATIONS", Mot_Cle: "EMAIL" },
      ],
    },
    select: { Valeur: true },
  });

  if (!setting?.Valeur) return true;
  return setting.Valeur.toLowerCase() !== "false" && setting.Valeur !== "0";
}

async function getAlarmEmailRecipients(idLieu?: number | null) {
  if (!idLieu) {
    return { recipients: [], skipped: "no_lieu" as const };
  }

  const location = await prisma.t_lieu.findUnique({
    where: { Id_Lieu: idLieu },
    select: {
      t_lieu_mail_tel: {
        where: { Est_Via_Email: true },
        orderBy: [{ Ordre_Contact: "asc" }, { Id_Mail_Tel: "asc" }],
        select: {
          Id_Utilisateur: true,
          Est_Via_Email: true,
        },
      },
    },
  });

  const userIds = Array.from(
    new Set(
      (location?.t_lieu_mail_tel ?? [])
        .filter((row) => row.Est_Via_Email)
        .map((row) => row.Id_Utilisateur)
        .filter((id): id is number => typeof id === "number"),
    ),
  );

  if (userIds.length === 0) {
    return { recipients: [], skipped: "no_recipients_for_lieu" as const };
  }

  const users = await prisma.t_utilisateur.findMany({
    where: {
      Id_Utilisateur: { in: userIds },
      Est_Archive: false,
      Adresse_Email: { not: null },
    },
    select: {
      Id_Utilisateur: true,
      Adresse_Email: true,
    },
  });

  const byId = new Map<number, string>();
  for (const user of users) {
    if (user.Adresse_Email) {
      byId.set(user.Id_Utilisateur, user.Adresse_Email.trim().toLowerCase());
    }
  }

  const recipients = userIds
    .map((id) => byId.get(id))
    .filter((email): email is string => !!email);

  if (recipients.length === 0) {
    return { recipients: [], skipped: "no_valid_emails" as const };
  }

  return {
    recipients: Array.from(new Set(recipients)),
    skipped: null as null,
  };
}

function formatDateTime(value?: Date | null): string | undefined {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(value);
}

export function mapAlarmTypeLabel(type?: string | null): string {
  switch ((type ?? "").toUpperCase()) {
    case "H":
      return "ALARME HAUTE";
    case "B":
      return "ALARME BASSE";
    case "N":
      return "NON REPONSE";
    case "T":
      return "ALARME TERMINEE";
    default:
      return "AUTRE";
  }
}

function buildSparklinePng(input: {
  points: Array<{ xLabel: string; value: number | null }>;
  high?: number | null;
  low?: number | null;
  consigne?: number | null;
}) {
  const width = 640;
  const height = 240;
  const padX = 24;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const values = input.points
    .map((p) => p.value)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));

  if (values.length < 2) {
    return null;
  }

  const refs = [input.high, input.low, input.consigne].filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  const all = [...values, ...refs];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;

  const toX = (index: number) => Math.round(padX + (index / Math.max(1, input.points.length - 1)) * innerW);
  const toY = (value: number) => Math.round(padTop + ((max - value) / span) * innerH);

  const png = new PNG({ width, height });

  const setPixel = (x: number, y: number, rgba: [number, number, number, number]) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (width * y + x) * 4;
    png.data[idx] = rgba[0];
    png.data[idx + 1] = rgba[1];
    png.data[idx + 2] = rgba[2];
    png.data[idx + 3] = rgba[3];
  };

  const fillRect = (x: number, y: number, w: number, h: number, rgba: [number, number, number, number]) => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        setPixel(xx, yy, rgba);
      }
    }
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number, rgba: [number, number, number, number]) => {
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      setPixel(x, y, rgba);
      setPixel(x + 1, y, rgba);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const drawDashedHorizontal = (y: number, rgba: [number, number, number, number]) => {
    const dash = 6;
    const gap = 4;
    let x = padX;
    while (x < width - padX) {
      for (let i = 0; i < dash && x + i < width - padX; i++) {
        setPixel(x + i, y, rgba);
      }
      x += dash + gap;
    }
  };

  fillRect(0, 0, width, height, [255, 255, 255, 255]);
  fillRect(padX, padTop, innerW, innerH, [248, 250, 252, 255]);

  const highY = typeof input.high === "number" ? toY(input.high) : null;
  const lowY = typeof input.low === "number" ? toY(input.low) : null;
  const consigneY = typeof input.consigne === "number" ? toY(input.consigne) : null;

  if (highY !== null) {
    fillRect(padX, padTop, innerW, Math.max(0, highY - padTop), [239, 68, 68, 36]);
  }
  if (lowY !== null) {
    fillRect(padX, lowY, innerW, Math.max(0, padTop + innerH - lowY), [59, 130, 246, 36]);
  }

  for (let i = 1; i <= 4; i++) {
    const y = Math.round(padTop + (i / 5) * innerH);
    drawLine(padX, y, width - padX, y, [226, 232, 240, 255]);
  }

  drawLine(padX, padTop, width - padX, padTop, [203, 213, 225, 255]);
  drawLine(padX, padTop + innerH, width - padX, padTop + innerH, [203, 213, 225, 255]);
  drawLine(padX, padTop, padX, padTop + innerH, [203, 213, 225, 255]);
  drawLine(width - padX, padTop, width - padX, padTop + innerH, [203, 213, 225, 255]);

  if (highY !== null) drawDashedHorizontal(highY, [220, 38, 38, 255]);
  if (lowY !== null) drawDashedHorizontal(lowY, [220, 38, 38, 255]);
  if (consigneY !== null) drawLine(padX, consigneY, width - padX, consigneY, [17, 24, 39, 255]);

  let prev: { x: number; y: number } | null = null;
  input.points.forEach((point, index) => {
    if (typeof point.value !== "number" || !Number.isFinite(point.value)) {
      prev = null;
      return;
    }
    const curr = { x: toX(index), y: toY(point.value) };
    if (prev) {
      drawLine(prev.x, prev.y, curr.x, curr.y, [59, 130, 246, 255]);
    }
    prev = curr;
  });

  return PNG.sync.write(png);
}

async function buildAlarmChartInlineAttachment(input: {
  alarmId?: number | null;
  idLieu?: number | null;
  triggeredAt?: Date | null;
  unit?: string | null;
  consigneSup?: number | null;
  consigneInf?: number | null;
  consigne?: number | null;
}): Promise<{ attachment: EmailAttachment; chartSrc: string } | undefined> {
  if (!input.idLieu || !input.triggeredAt) return undefined;

  const end = new Date(input.triggeredAt.getTime() + 15 * 60 * 1000);
  const start = new Date(input.triggeredAt.getTime() - 3 * 60 * 60 * 1000);

  const rows = await prismaMesure.tm_mesures.findMany({
    where: {
      Id_Lieu: input.idLieu,
      Date_Heure_Mesure: {
        gte: start,
        lte: end,
      },
      Est_Valeur_Null: 0,
    },
    orderBy: {
      Date_Heure_Mesure: "asc",
    },
    take: 120,
    select: {
      Date_Heure_Mesure: true,
      Valeur: true,
    },
  });

  const points = rows.map((row) => ({
    xLabel: formatDateTime(row.Date_Heure_Mesure) ?? "",
    value: row.Valeur != null ? Number(row.Valeur) : null,
  }));

  const pngBuffer = buildSparklinePng({
    points,
    high: input.consigneSup ?? null,
    low: input.consigneInf ?? null,
    consigne: input.consigne ?? null,
  });

  if (!pngBuffer) return undefined;

  try {
    const safeAlarmId = input.alarmId ?? "unknown";
    const cid = `alarm-chart-${safeAlarmId}@vigitemp.local`;

    return {
      chartSrc: `cid:${cid}`,
      attachment: {
        filename: `alarme-${safeAlarmId}.png`,
        content: pngBuffer,
        contentType: "image/png",
        cid,
        disposition: "inline",
      },
    };
  } catch (error) {
    log.warn("ALARM_EMAIL", "Failed to build alarm chart attachment", {
      alarmId: input.alarmId,
      idLieu: input.idLieu,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

function buildSubject(eventType: AlarmEmailEventType, lieu: string) {
  switch (eventType) {
    case "triggered":
      return `[VIGITEMP] ALARME DECLENCHEE - ${lieu}`;
    case "ended":
      return `[VIGITEMP] ALARME TERMINEE - ${lieu}`;
    case "acknowledged":
      return `[VIGITEMP] ALARME ACQUITTEE - ${lieu}`;
  }
}

export async function sendAlarmEventEmails(input: SendAlarmEventEmailInput) {
  const alarmEmailEnabled = await isAlarmEmailNotificationEnabled();
  if (!alarmEmailEnabled) {
    return { attempted: 0, sent: 0, skipped: "notifications_disabled" as const };
  }

  const recipientsState = await getAlarmEmailRecipients(input.idLieu);
  if (recipientsState.skipped) {
    return { attempted: 0, sent: 0, skipped: recipientsState.skipped };
  }

  const recipients = recipientsState.recipients;
  const smtpEnabled = await isEmailEnabled();
  if (!smtpEnabled) {
    return { attempted: recipients.length, sent: 0, skipped: "smtp_not_ready" as const };
  }

  const chartInline =
    input.eventType === "triggered"
      ? await buildAlarmChartInlineAttachment({
          alarmId: input.alarmId,
          idLieu: input.idLieu,
          triggeredAt: input.triggeredAt,
          unit: input.unite,
          consigneSup: input.consigneSup,
          consigneInf: input.consigneInf,
          consigne: input.consigne,
        })
      : undefined;

  const alarmTypeLabel = mapAlarmTypeLabel(input.alarmTypeCode);
  const subject = buildSubject(input.eventType, input.lieu);

  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const result = await sendEmail({
          to,
          subject,
          attachments: chartInline ? [chartInline.attachment] : undefined,
          react: AlarmEventNotificationEmail({
            eventType: input.eventType,
            site: input.site ?? undefined,
            lieu: input.lieu,
            sonde: input.sonde ?? undefined,
            alarmType: alarmTypeLabel,
            triggeredAt: formatDateTime(input.triggeredAt),
            endedAt: formatDateTime(input.endedAt),
            acknowledgedAt: formatDateTime(input.acknowledgedAt),
            acknowledgedBy: input.acknowledgedBy ?? undefined,
            lastValue: input.lastValue ?? undefined,
            details: input.details ?? undefined,
            alarmUrl: input.alarmUrl ?? undefined,
            chartSrc: chartInline?.chartSrc,
          }),
        });

        if (!result.success) {
          log.warn("ALARM_EMAIL", "Alarm event email send failed", {
            eventType: input.eventType,
            alarmId: input.alarmId,
            to,
            error: result.error || "unknown_error",
          });
        }

        return result.success;
      } catch (error) {
        log.warn("ALARM_EMAIL", "Alarm event email send exception", {
          eventType: input.eventType,
          alarmId: input.alarmId,
          to,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    }),
  );

  const sent = results.filter(Boolean).length;
  return { attempted: recipients.length, sent, skipped: null as null };
}
