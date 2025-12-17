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
        Reset_Password_Token: hashedToken,
        Reset_Password_Expires: {
          gte: new Date(), // Token not expired
        },
        Est_Archive: false,
      },
      include: {
        t_ancien_mot_de_passe: {
          orderBy: {
            Id_Ancien_Mot_De_Passe: "desc",
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
    if (user.Mot_De_Passe) {
      const isSameAsCurrent = await bcrypt.compare(newPassword, user.Mot_De_Passe as string);
      if (isSameAsCurrent) {
        return NextResponse.json(
          { error: "Le nouveau mot de passe ne peut pas être identique au mot de passe actuel." },
          { status: 400 }
        );
      }
    }

    // Check if new password matches any old password
    for (const oldPassword of user.t_ancien_mot_de_passe) {
      if (oldPassword.Mot_De_Passe) {
        const isSameAsOld = await bcrypt.compare(newPassword, oldPassword.Mot_De_Passe as string);
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
    if (user.Mot_De_Passe) {
      await prisma.t_ancien_mot_de_passe.create({
        data: {
          Id_Utilisateur: user.Id_Utilisateur,
          Mot_De_Passe: user.Mot_De_Passe as string,
        },
      });
    }

    // Update password and clear reset token
    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.Id_Utilisateur },
      data: {
        Mot_De_Passe: hashedPassword,
        Date_Derniere_Modification_MDP: new Date(),
        Reset_Password_Token: null,
        Reset_Password_Expires: null,
        Est_Mot_De_Passe_Temporaire: false,
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
