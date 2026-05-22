import { prisma, prismaMesure } from "@/lib/prisma";
import { getSystemEmailCcRecipients, isEmailEnabled, isSystemEmailFallbackEnabled, sendEmail, type EmailAttachment } from "@/lib/email";
import { log } from "@/lib/logger";
import AlarmEventNotificationEmail from "../../emails/alarm-event-notification";
import { PNG } from "pngjs";
import { getGlobalAppLanguage, type AppLanguage } from "@/lib/app-language";
import { formatMeasureValue, normalizeUnitLabel } from "@/lib/measurements";

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


function parseBooleanSetting(value: string | null | undefined, fallback = true) {
  if (value == null || value === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return fallback;
}

async function isAlarmEventTypeEnabled(eventType: AlarmEmailEventType) {
  if (eventType === "triggered") return true;

  const motCle = eventType === "acknowledged" ? "alarm_email_acknowledged" : "alarm_email_ended";
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: "notifications", Mot_Cle: motCle },
        { Section: "NOTIFICATIONS", Mot_Cle: motCle.toUpperCase() },
      ],
    },
    select: { Valeur: true },
  });

  return parseBooleanSetting(setting?.Valeur, true);
}

async function getAlarmEmailRecipients(idLieu?: number | null) {
  const fallbackEnabled = await isSystemEmailFallbackEnabled();
  const systemRecipients = await getSystemEmailCcRecipients();
  const fallbackRecipients = fallbackEnabled ? systemRecipients : [];

  if (!idLieu) {
    if (fallbackRecipients.length > 0) {
      return { recipients: fallbackRecipients, ccRecipients: [], skipped: null as null, usedSystemFallback: true };
    }
    return { recipients: [], ccRecipients: [], skipped: "no_lieu" as const, usedSystemFallback: false };
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
    if (fallbackRecipients.length > 0) {
      return { recipients: fallbackRecipients, ccRecipients: [], skipped: null as null, usedSystemFallback: true };
    }

    return { recipients: [], ccRecipients: [], skipped: "no_recipients_for_lieu" as const, usedSystemFallback: false };
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
    if (fallbackRecipients.length > 0) {
      return { recipients: fallbackRecipients, ccRecipients: [], skipped: null as null, usedSystemFallback: true };
    }

    return { recipients: [], ccRecipients: [], skipped: "no_valid_emails" as const, usedSystemFallback: false };
  }

  return {
    recipients: Array.from(new Set(recipients)),
    ccRecipients: systemRecipients,
    skipped: null as null,
    usedSystemFallback: false,
  };
}

function formatDateTime(value: Date | null | undefined, locale: AppLanguage): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  // MySQL DATETIME is read by Prisma as UTC even though the value is a local wall-clock.
  // Use UTC components directly so emails show the stored alarm time, not stored time + local TZ offset.
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  if (locale === "en") return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function formatChartDateTime(value: Date): string {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function sanitizeAlarmText(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replace(/Ã‚Â°/g, "°")
    .replace(/Â°/g, "°")
    .replace(/â°C/g, "°C")
    .replace(/Â°C/g, "°C")
    .replace(/e/g, "é")
    .replace(/Ã¨/g, "è")
    .replace(/Ãª/g, "ê")
    .replace(/Ã /g, "à")
    .replace(/Ã§/g, "ç")
    .replace(/Ã´/g, "ô")
    .replace(/Ã®/g, "î");
}

function formatLastValue(value: string | null | undefined, unit: string | null | undefined, locale: AppLanguage): string | undefined {
  const sanitized = sanitizeAlarmText(value);
  if (!sanitized) return undefined;

  const match = sanitized.trim().match(/^(-?\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return sanitized;

  const numeric = Number(match[1].replace(",", "."));
  if (!Number.isFinite(numeric)) return sanitized;

  const suffix = normalizeUnitLabel(match[2]?.trim() || unit);
  return `${formatMeasureValue(numeric, 2, locale === "en" ? "en-US" : "fr-FR")}${suffix}`;
}

export function mapAlarmTypeLabel(type: string | null | undefined, locale: AppLanguage): string {
  switch ((type ?? "").toUpperCase()) {
    case "H":
      return locale === "en" ? "HIGH ALARM" : "ALARME HAUTE";
    case "B":
      return locale === "en" ? "LOW ALARM" : "ALARME BASSE";
    case "N":
      return locale === "en" ? "NO RESPONSE" : "NON REPONSE";
    case "M":
      return locale === "en" ? "MODULE ISSUE" : "PROBLEME MODULE";
    case "A":
    case "S":
      return locale === "en" ? "POWER / MAINS" : "SECTEUR / ALIMENTATION";
    case "T":
      return locale === "en" ? "ENDED ALARM" : "ALARME TERMINEE";
    case "GSP_BATTERY":
      return locale === "en" ? "GSP LOW BATTERY" : "BATTERIE FAIBLE GSP";
    default:
      return locale === "en" ? "OTHER" : "AUTRE";
  }
}

function buildSparklinePng(input: {
  points: Array<{ xLabel: string; value: number | null }>;
  high?: number | null;
  low?: number | null;
  consigne?: number | null;
  unit?: string | null;
  startLabel?: string;
  endLabel?: string;
}) {
  const width = 840;
  const height = 360;
  const padX = 24;
  const padTop = 56;
  const padBottom = 72;
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

  // 5x7 uppercase bitmap font for chart labels.
  const FONT_5X7: Record<string, string[]> = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "/": ["00001", "00010", "00100", "01000", "10000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    ",": ["00000", "00000", "00000", "00000", "00110", "00110", "00100"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  const drawTinyText = (x: number, y: number, text: string, rgba: [number, number, number, number], scale = 1) => {
    let cursorX = x;
    const normalized = (text ?? "").toUpperCase();
    for (const ch of normalized) {
      const glyph = FONT_5X7[ch] ?? FONT_5X7[" "];
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col] !== "1") continue;
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              setPixel(cursorX + col * scale + sx, y + row * scale + sy, rgba);
            }
          }
        }
      }
      cursorX += 6 * scale;
    }
  };

  const drawTag = (
    x: number,
    y: number,
    text: string,
    fg: [number, number, number, number],
    bg: [number, number, number, number],
  ) => {
    const scale = 1;
    const widthPx = Math.max(0, text.length * 6 * scale - 1);
    const boxX = Math.max(2, Math.min(width - widthPx - 6, x));
    const boxY = Math.max(2, Math.min(height - 12, y));
    fillRect(boxX - 2, boxY - 1, widthPx + 4, 9, bg);
    drawTinyText(boxX, boxY, text, fg, scale);
  };

  const normalizedUnit = (() => {
    const trimmed = input.unit?.trim();
    if (!trimmed || trimmed === "C") return "\u00B0C";
    return trimmed;
  })();

  const formatLegendValue = (value?: number | null) =>
    value === null || value === undefined || Number.isNaN(value)
      ? "N/A"
      : `${formatMeasureValue(Number(value), 2, "fr-FR")}${normalizedUnit}`;

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

  const headerY = 8;
  drawTinyText(padX, headerY, `SUP: ${formatLegendValue(input.high)}`, [220, 38, 38, 255], 2);
  drawTinyText(padX + 310, headerY, `CONSIGNE: ${formatLegendValue(input.consigne)}`, [17, 24, 39, 255], 2);

  const infText = `INF: ${formatLegendValue(input.low)}`;
  drawTinyText(width - padX - Math.max(0, infText.length * 12), headerY, infText, [220, 38, 38, 255], 2);

  const startText = `DE: ${input.startLabel ?? "-"}`;
  const endText = `A: ${input.endLabel ?? "-"}`;
  drawTinyText(padX, height - 38, startText, [71, 85, 105, 255], 2);
  drawTinyText(width - padX - Math.max(0, endText.length * 12), height - 38, endText, [71, 85, 105, 255], 2);

  if (highY !== null) {
    drawTag(padX + 8, Math.max(padTop + 2, highY - 10), `SUP ${formatLegendValue(input.high)}`, [127, 29, 29, 255], [254, 226, 226, 220]);
  }
  if (consigneY !== null) {
    drawTag(
      Math.max(padX + 8, width - padX - 170),
      Math.max(padTop + 2, consigneY - 10),
      `CONSIGNE ${formatLegendValue(input.consigne)}`,
      [17, 24, 39, 255],
      [226, 232, 240, 220],
    );
  }
  if (lowY !== null) {
    drawTag(padX + 8, Math.max(padTop + 2, lowY - 10), `INF ${formatLegendValue(input.low)}`, [127, 29, 29, 255], [254, 226, 226, 220]);
  }

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
    xLabel: formatChartDateTime(row.Date_Heure_Mesure),
    value: row.Valeur != null ? Number(row.Valeur) : null,
  }));

  const startLabel = points[0]?.xLabel;
  const endLabel = points[points.length - 1]?.xLabel;

  const pngBuffer = buildSparklinePng({
    points,
    high: input.consigneSup ?? null,
    low: input.consigneInf ?? null,
    consigne: input.consigne ?? null,
    unit: input.unit ?? "\u00B0C",
    startLabel,
    endLabel,
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

function buildSubject(eventType: AlarmEmailEventType, lieu: string, locale: AppLanguage) {
  switch (eventType) {
    case "triggered":
      return locale === "en"
        ? `[VIGISENSYS] ALARM TRIGGERED - ${lieu}`
        : `[VIGISENSYS] ALARME DECLENCHEE - ${lieu}`;
    case "ended":
      return locale === "en"
        ? `[VIGISENSYS] ALARM ENDED - ${lieu}`
        : `[VIGISENSYS] ALARME TERMINEE - ${lieu}`;
    case "acknowledged":
      return locale === "en"
        ? `[VIGISENSYS] ALARM ACKNOWLEDGED - ${lieu}`
        : `[VIGISENSYS] ALARME ACQUITTEE - ${lieu}`;
  }
}

export async function sendAlarmEventEmails(input: SendAlarmEventEmailInput) {
  const alarmEmailEnabled = await isAlarmEmailNotificationEnabled();
  if (!alarmEmailEnabled) {
    return { attempted: 0, sent: 0, skipped: "notifications_disabled" as const };
  }

  const eventEnabled = await isAlarmEventTypeEnabled(input.eventType);
  if (!eventEnabled) {
    return { attempted: 0, sent: 0, skipped: "event_type_disabled" as const };
  }

  const recipientsState = await getAlarmEmailRecipients(input.idLieu);
  if (recipientsState.skipped) {
    return { attempted: 0, sent: 0, skipped: recipientsState.skipped };
  }

  const recipients = recipientsState.recipients;
  const ccRecipients = recipientsState.ccRecipients;
  log.info("ALARM_EMAIL", "Alarm email recipients resolved", {
    eventType: input.eventType,
    alarmId: input.alarmId,
    idLieu: input.idLieu,
    to: recipients,
    cc: ccRecipients,
    usedSystemFallback: recipientsState.usedSystemFallback,
  });

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

  const locale = await getGlobalAppLanguage();
  const alarmTypeLabel = mapAlarmTypeLabel(input.alarmTypeCode, locale);
  const subject = buildSubject(input.eventType, input.lieu, locale);
  const lastValue = formatLastValue(input.lastValue, input.unite, locale);
  const details = sanitizeAlarmText(input.details);

  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const result = await sendEmail({
          to,
          cc: ccRecipients,
          subject,
          includeSystemCc: false,
          attachments: chartInline ? [chartInline.attachment] : undefined,
          react: AlarmEventNotificationEmail({
            eventType: input.eventType,
            site: input.site ?? undefined,
            lieu: input.lieu,
            sonde: input.sonde ?? undefined,
            alarmType: alarmTypeLabel,
            locale,
            triggeredAt: formatDateTime(input.triggeredAt, locale),
            endedAt: formatDateTime(input.endedAt, locale),
            acknowledgedAt: formatDateTime(input.acknowledgedAt, locale),
            acknowledgedBy: input.acknowledgedBy ?? undefined,
            lastValue,
            details,
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
  return {
    attempted: recipients.length,
    sent,
    skipped: null as null,
    usedSystemFallback: recipientsState.usedSystemFallback,
  };
}
