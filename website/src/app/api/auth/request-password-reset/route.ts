import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, isEmailEnabled } from "@/lib/email";
import PasswordResetEmail from "../../../../../emails/password-reset";
import crypto from "crypto";
import { z } from "zod";

const requestResetSchema = z.object({
  email: z.email("Email invalide"),
});

/**
 * POST /api/auth/request-password-reset
 * Demande de réinitialisation de mot de passe
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = requestResetSchema.parse(body);

    // Find user by email
    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Adresse_Email: email,
        Est_Archive: false,
      },
    });

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    // Check if email is enabled
    if (!(await isEmailEnabled())) {
      return NextResponse.json(
        { error: "Le système d'envoi d'emails n'est pas configuré." },
        { status: 503 }
      );
    }

    // Generate secure reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token before storing (security: prevent token theft from DB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save hashed token to database
    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.Id_Utilisateur },
      data: {
        Reset_Password_Token: hashedToken,
        Reset_Password_Expires: expiresAt,
      },
    });

    // Send email with reset link (includes unhashed token)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe Vigitemp",
      react: PasswordResetEmail({
        resetUrl,
        firstName: user.Prenom || undefined,
        lastName: user.Nom || undefined,
        expiresIn: "1 heure",
      }),
    });

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Request password reset error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la demande de réinitialisation." },
      { status: 500 }
    );
  }
}
