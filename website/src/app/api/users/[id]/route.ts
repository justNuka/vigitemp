import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const updateUserSchema = z.object({
  nom: z.string().optional(),
  prenom: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  profileId: z.string().optional(),
  expiryDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.Id_Utilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.Profil_Utilisateur || "user",
      status: !user.Archive ? "active" : "inactive",
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const updateData: any = {};
    
    // Hash password if provided
    if (data.password) {
      updateData.Mot_De_Passe = await bcrypt.hash(data.password, 10);
      updateData.Date_Derniere_Modification_MDP = new Date();
      updateData.Mot_De_Passe_Temporaire = false;
    }
    
    if (data.profileId) updateData.Profil_Utilisateur = data.profileId;
    if (data.nom) updateData.Nom = data.nom;
    if (data.prenom) updateData.Prenom = data.prenom;
    if (data.email) updateData.Adresse_Email = data.email;
    if (data.expiryDate !== undefined) updateData.Date_Validite = data.expiryDate;

    const user = await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: userId },
      data: updateData,
    });

    // Log user update
    const changes: any = {};
    if (data.nom) changes.nom = data.nom;
    if (data.prenom) changes.prenom = data.prenom;
    if (data.email) changes.email = data.email;
    if (data.profileId) changes.profile = data.profileId;
    if (data.password) changes.passwordChanged = true;
    
    log.data.update(
      "Utilisateur",
      userId,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      changes
    );

    // Invalider le cache des utilisateurs
    revalidateTag("users-data", "default");

    return NextResponse.json({
      id: user.Id_Utilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.Profil_Utilisateur || "user",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { id } = await params;
    const userId = parseInt(id);

    // Get user info before deletion
    const userToDelete = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
      select: { Login: true },
    });

    // Soft delete
    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: userId },
      data: { Archive: true },
    });

    // Log user deletion
    log.data.delete(
      "Utilisateur",
      userId,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      `Archive de l'utilisateur ${userToDelete?.Login || userId}`
    );

    // Invalider le cache des utilisateurs
    revalidateTag("users-data", "default");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
