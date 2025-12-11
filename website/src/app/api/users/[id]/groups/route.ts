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

    const groups = await prisma.t_liaison_utilisateur_groupe.findMany({
      where: { IdUtilisateur: userId },
      select: {
        IdLiaison: true,
        IdGroupe: true,
        t_groupe: {
          select: {
            IdGroupe: true,
            NomGroupe: true,
            NumeroRegroupement: true,
            Archive: true,
          },
        },
      },
    });

    const formattedGroups = groups
      .filter(g => g.t_groupe) // Filter out null groups
      .map(liaison => ({
        idLiaison: liaison.IdLiaison,
        idGroupe: liaison.t_groupe!.IdGroupe,
        nomGroupe: liaison.t_groupe!.NomGroupe,
        numeroRegroupement: liaison.t_groupe!.NumeroRegroupement,
        archive: liaison.t_groupe!.Archive,
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
      where: { IdGroupe: idGroupe },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: userId },
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
        IdUtilisateur: userId,
        IdGroupe: idGroupe,
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
        IdUtilisateur: userId,
        IdGroupe: idGroupe,
      },
      select: {
        IdLiaison: true,
        t_groupe: {
          select: {
            IdGroupe: true,
            NomGroupe: true,
            NumeroRegroupement: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Group assigned to user successfully",
      group: {
        idLiaison: liaison.IdLiaison,
        idGroupe: liaison.t_groupe?.IdGroupe,
        nomGroupe: liaison.t_groupe?.NomGroupe,
        numeroRegroupement: liaison.t_groupe?.NumeroRegroupement,
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
