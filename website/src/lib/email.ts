import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { prisma } from "@/lib/prisma";
import { decryptSmtpPassword } from "@/lib/secret-crypto";
import { log } from "@/lib/logger";

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  enabled: boolean;
}

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
  encoding?: string;
  disposition?: string;
};

function parseRecipients(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[;,\n\r]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}


/**
 * Get email configuration from database parameters
 * Uses the new parameter structure with section: SECURITE_EMAIL
 */
async function getEmailConfig(): Promise<EmailConfig> {
  const params = await prisma.t_parametre.findMany({
    where: {
      Section: "SECURITE_EMAIL",
    },
  });

  const config: EmailConfig = {
    host: "",
    port: 587,
    user: "",
    password: "",
    from: "noreply@alwaysdata.net",
    enabled: false,
  };

  params.forEach((param) => {
    switch (param.Mot_Cle) {
      case "SMTP_SERVEUR":
        config.host = param.Valeur || "sandbox.smtp.mailtrap.io";
        break;
      case "SMTP_PORT":
        config.port = parseInt(param.Valeur || "587");
        break;
      case "SMTP_UTILISATEUR":
        config.user = param.Valeur || "eb3e24c69a3763";
        break;
      case "SMTP_MOT_DE_PASSE":
        config.password = decryptSmtpPassword(param.Valeur || "");
        break;
      case "SMTP_EXPEDITEUR":
        config.from = param.Valeur || "noreply@alwaysdata.net";
        break;
      case "SMTP_ACTIVATION":
        config.enabled = param.Valeur === "1" || param.Valeur?.toLowerCase() === "true";
        break;
    }
  });
  return config;
}

export async function getSystemEmailCcRecipients(): Promise<string[]> {
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: "notifications", Mot_Cle: "alarm_email_recipients" },
        { Section: "NOTIFICATIONS", Mot_Cle: "ALARM_EMAIL_RECIPIENTS" },
      ],
    },
    select: { Valeur: true },
  });

  return Array.from(new Set(parseRecipients(setting?.Valeur)));
}

/**
 * Send an email using the configured SMTP server
 */
export async function sendEmail({
  to,
  cc,
  includeSystemCc = true,
  subject,
  react,
  attachments,
}: {
  to: string;
  cc?: string | string[];
  includeSystemCc?: boolean;
  subject: string;
  react: React.ReactElement;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig();

    if (!config.enabled) {
      log.info("EMAIL", "email_sending_disabled");
      return { success: false, error: "Email sending is disabled" };
    }

    if (!config.host || !config.user || !config.password) {
      log.error("email", "smtp_configuration_incomplete");
      return { success: false, error: "SMTP configuration is incomplete" };
    }

    const toNormalized = parseRecipients(to);
    const explicitCc = Array.isArray(cc) ? cc.flatMap((item) => parseRecipients(item)) : parseRecipients(cc);
    const systemCc = includeSystemCc ? await getSystemEmailCcRecipients() : [];

    const toSet = new Set(toNormalized);
    const ccRecipients = Array.from(new Set([...explicitCc, ...systemCc])).filter((email) => !toSet.has(email));

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    // Render React email to HTML
    const html = await render(react);

    // Send email
    await transporter.sendMail({
      from: config.from,
      to,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      subject,
      html,
      attachments,
    });

    log.info("EMAIL", "email_sent", { to });
    return { success: true };
  } catch (error) {
    log.error("email", "failed_to_send_email", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if email sending is enabled
 */
export async function isEmailEnabled(): Promise<boolean> {
  const config = await getEmailConfig();
  return config.enabled && !!config.host && !!config.user && !!config.password;
}

export async function isSystemEmailFallbackEnabled(): Promise<boolean> {
  const setting = await prisma.t_parametre.findFirst({
    where: {
      OR: [
        { Section: "notifications", Mot_Cle: "alarm_email_fallback_to_system" },
        { Section: "NOTIFICATIONS", Mot_Cle: "ALARM_EMAIL_FALLBACK_TO_SYSTEM" },
      ],
    },
    select: { Valeur: true },
  });

  if (!setting?.Valeur) return false;
  const normalized = setting.Valeur.trim().toLowerCase();
  return ["true", "1", "on", "yes"].includes(normalized);
}
