import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { prisma } from "@/lib/prisma";

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  enabled: boolean;
}

/**
 * Get email configuration from database parameters
 */
async function getEmailConfig(): Promise<EmailConfig> {
  const params = await prisma.t_parametre.findMany({
    where: {
      Section: "security:email",
    },
  });

  const config: EmailConfig = {
    host: "",
    port: 587,
    user: "",
    password: "",
    from: "noreply@vigitemp.com",
    enabled: false,
  };

  params.forEach((param) => {
    switch (param.MotCle) {
      case "smtp_host":
        config.host = param.Valeur || "sandbox.smtp.mailtrap.io";
        break;
      case "smtp_port":
        config.port = parseInt(param.Valeur || "587");
        break;
      case "smtp_user":
        config.user = param.Valeur || "eb3e24c69a3763";
        break;
      case "smtp_password":
        config.password = param.Valeur || "b2056d25397007";
        break;
      case "smtp_from":
        config.from = param.Valeur || "noreply@vigitemp.com";
        break;
      case "smtp_enabled":
        config.enabled = param.Valeur === "true";
        break;
    }
  });
  return config;
}

/**
 * Send an email using the configured SMTP server
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig();

    if (!config.enabled) {
      console.log("[Email] Email sending is disabled");
      return { success: false, error: "Email sending is disabled" };
    }

    if (!config.host || !config.user || !config.password) {
      console.error("[Email] SMTP configuration is incomplete");
      return { success: false, error: "SMTP configuration is incomplete" };
    }

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
      subject,
      html,
    });

    console.log(`[Email] Successfully sent email to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
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
