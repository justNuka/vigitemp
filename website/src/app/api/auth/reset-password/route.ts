import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

/**
 * POST /api/auth/reset-password
 * Réinitialise le mot de passe avec un token valide
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Hash the token to compare with stored version
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await prisma.t_utilisateur.findFirst({
      where: {
        ResetPasswordToken: hashedToken,
        ResetPasswordExpires: {
          gte: new Date(), // Token not expired
        },
        Archive: false,
      },
      include: {
        t_ancienmotpasse: {
          orderBy: {
            IdAncienMotPasse: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token invalide ou expiré. Veuillez refaire une demande de réinitialisation." },
        { status: 400 }
      );
    }

    // Check if new password matches current password
    if (user.Mot_de_passe) {
      const isSameAsCurrent = await bcrypt.compare(newPassword, user.Mot_de_passe);
      if (isSameAsCurrent) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe ne peut pas être identique au mot de passe actuel." },
          { status: 400 }
        );
      }
    }

    // Check if new password matches any old password
    for (const oldPassword of user.t_ancienmotpasse) {
      if (oldPassword.MotDePasse) {
        const isSameAsOld = await bcrypt.compare(newPassword, oldPassword.MotDePasse);
        if (isSameAsOld) {
          return NextResponse.json(
            { error: "Ce mot de passe a déjà été utilisé. Veuillez en choisir un nouveau." },
            { status: 400 }
          );
        }
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save current password to history before updating
    if (user.Mot_de_passe) {
      await prisma.t_ancienmotpasse.create({
        data: {
          IdUtilisateur: user.IdUtilisateur,
          MotDePasse: user.Mot_de_passe,
        },
      });
    }

    // Update password and clear reset token
    await prisma.t_utilisateur.update({
      where: { IdUtilisateur: user.IdUtilisateur },
      data: {
        Mot_de_passe: hashedPassword,
        DateDerniereModificationMDP: new Date(),
        ResetPasswordToken: null,
        ResetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la réinitialisation." },
      { status: 500 }
    );
  }
}
