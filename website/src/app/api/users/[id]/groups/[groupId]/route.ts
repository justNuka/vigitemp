import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/users/[id]/groups/[liaisionId] - Remove group from user
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const { id, groupId } = await params;
    const userId = parseInt(id);
    const idLiaison = parseInt(groupId);

    if (isNaN(userId) || isNaN(idLiaison)) {
      return NextResponse.json(
        { error: "Invalid user ID or liaison ID" },
        { status: 400 }
      );
    }

    // Find and delete the liaison
    const liaison = await prisma.t_liaison_utilisateur_groupe.findUnique({
      where: { IdLiaison: idLiaison },
    });

    if (!liaison || liaison.IdUtilisateur !== userId) {
      return NextResponse.json(
        { error: "Liaison not found or does not belong to this user" },
        { status: 404 }
      );
    }

    await prisma.t_liaison_utilisateur_groupe.delete({
      where: { IdLiaison: idLiaison },
    });

    return NextResponse.json({
      message: "Group removed from user successfully",
    });
  } catch (error) {
    console.error("Remove group from user error:", error);
    return NextResponse.json(
      { error: "Failed to remove group from user" },
      { status: 500 }
    );
  }
}
