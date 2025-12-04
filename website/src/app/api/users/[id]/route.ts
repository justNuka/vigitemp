import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateUserSchema = z.object({
  displayName: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "user"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: userId },
      include: {
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.IdUtilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.t_profil?.ProfilUtilisateur || "user",
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
    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const updateData: any = {};
    if (data.password) updateData.Mot_de_passe = data.password; // TEMP: should hash
    if (data.role) updateData.ProfilUtilisateur = data.role;

    // Parse displayName into Prenom and Nom if provided
    if (data.displayName) {
      const parts = data.displayName.split(" ");
      if (parts.length > 1) {
        updateData.Prenom = parts[0];
        updateData.Nom = parts.slice(1).join(" ");
      } else {
        updateData.Prenom = data.displayName;
      }
    }

    const user = await prisma.t_utilisateur.update({
      where: { IdUtilisateur: userId },
      data: updateData,
      include: {
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.IdUtilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.t_profil?.ProfilUtilisateur || "user",
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
    const { id } = await params;
    const userId = parseInt(id);

    // Soft delete
    await prisma.t_utilisateur.update({
      where: { IdUtilisateur: userId },
      data: { Archive: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
