import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/[id]/groups - Get all groups assigned to user
 * POST /api/users/[id]/groups - Add group to user
 * DELETE /api/users/[id]/groups/[groupId] - Remove group from user
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const liaisons = await prisma.t_liaison_utilisateur_groupe.findMany({
      where: { Id_Utilisateur: userId },
      include: {
        t_groupe: true,
      },
    });

    const formattedGroups = liaisons
      .filter((liaison) => liaison.t_groupe)
      .map((liaison) => ({
        idLiaison: liaison.Id_Liaison_u_g,
        idGroupe: liaison.t_groupe!.Id_Groupe,
        nomGroupe: liaison.t_groupe!.Nom_Groupe,
        numeroRegroupement: liaison.t_groupe!.Numero_Regroupement,
        archive: liaison.t_groupe!.Est_Archive,
      }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Get user groups error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user groups" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const { idGroupe } = body;

    if (isNaN(userId) || !idGroupe) {
      return NextResponse.json(
        { error: "Invalid user ID or group ID" },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.t_groupe.findUnique({
      where: { Id_Groupe: idGroupe },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if liaison already exists
    const existingLiaison = await prisma.t_liaison_utilisateur_groupe.findFirst({
      where: {
        Id_Utilisateur: userId,
        Id_Groupe: idGroupe,
      },
    });

    if (existingLiaison) {
      return NextResponse.json(
        { error: "User is already assigned to this group" },
        { status: 409 }
      );
    }

    // Create new liaison
    const liaison = await prisma.t_liaison_utilisateur_groupe.create({
      data: {
        Id_Utilisateur: userId,
        Id_Groupe: idGroupe,
      },
    });

    return NextResponse.json({
      message: "Group assigned to user successfully",
      group: {
        idLiaison: liaison.Id_Liaison_u_g,
        idGroupe: group.Id_Groupe,
        nomGroupe: group.Nom_Groupe,
        numeroRegroupement: group.Numero_Regroupement,
      },
    });
  } catch (error) {
    console.error("Add group to user error:", error);
    return NextResponse.json(
      { error: "Failed to assign group to user" },
      { status: 500 }
    );
  }
}
