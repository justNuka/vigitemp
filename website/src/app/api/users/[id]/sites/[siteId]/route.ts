import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/users/[id]/sites/[siteId] - Remove site from user
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; siteId: string }> }
) {
  try {
    const { id, siteId } = await params;
    const userId = parseInt(id);
    const id_Site = parseInt(siteId);

    if (isNaN(userId) || isNaN(id_Site)) {
      return NextResponse.json(
        { error: "Invalid user ID or site ID" },
        { status: 400 }
      );
    }

    // Find and delete the liaison
    const liaison = await prisma.t_liaison_utilisateur_site.findFirst({
      where: {
        Id_Utilisateur: userId,
        Id_Site: id_Site,
      },
    });

    if (!liaison) {
      return NextResponse.json(
        { error: "User is not assigned to this site" },
        { status: 404 }
      );
    }

    await prisma.t_liaison_utilisateur_site.delete({
      where: { Id_Liaison: liaison.Id_Liaison },
    });

    return NextResponse.json({
      message: "Site removed from user successfully",
    });
  } catch (error) {
    console.error("Remove site from user error:", error);
    return NextResponse.json(
      { error: "Failed to remove site from user" },
      { status: 500 }
    );
  }
}
