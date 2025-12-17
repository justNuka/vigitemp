import { NextRequest, NextResponse } from "next/server";
import { sendEmail, isEmailEnabled } from "@/lib/email";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PasswordResetEmail from "../../../../../emails/password-reset";

/**
 * POST /api/email/test
 * Send a test email to verify SMTP configuration
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check admin access
    const currentUserProfileStr = (await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: user.userId },
      select: { Profil_Utilisateur: true },
    }))?.Profil_Utilisateur;

    const userProfile = currentUserProfileStr
      ? await prisma.t_profil.findUnique({
          where: { Profil_Utilisateur: currentUserProfileStr },
          include: { t_liaison_profil_autorisation: { include: { t_autorisation: true } } },
        })
      : null;

    const hasAdminAccess =
      userProfile?.Profil_Utilisateur === "Administrateurs" ||
      userProfile?.t_liaison_profil_autorisation.some(
        (liaison) => liaison.t_autorisation.Code_Autorisation === "GERER_PROFIL"
      );

    if (!hasAdminAccess) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { toEmail } = body;

    if (!toEmail) {
      return NextResponse.json(
        { error: "Email destinataire requis" },
        { status: 400 }
      );
    }

    // Check if email is enabled
    const emailEnabled = await isEmailEnabled();
    if (!emailEnabled) {
      return NextResponse.json(
        { error: "Le système d'envoi d'emails n'est pas configuré" },
        { status: 503 }
      );
    }

    // Send test email using password reset template
    const result = await sendEmail({
      to: toEmail,
      subject: "Vigitemp - Test Email Configuration",
      react: PasswordResetEmail({
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=test-token-12345`,
        firstName: "Admin",
        expiresIn: "1 heure",
      }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send test email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Test email sent successfully",
      email: toEmail,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 }
    );
  }
}
