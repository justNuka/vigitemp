import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/[id]/sites - Get all sites assigned to user
 * POST /api/users/[id]/sites - Add site to user
 * DELETE /api/users/[id]/sites/[siteId] - Remove site from user
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

    const sites = await prisma.t_liaison_utilisateur_site.findMany({
      where: { Id_Utilisateur: userId },
      select: {
        Id_Site: true,
        Date_Affectation: true,
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
            Est_Archive: true,
          },
        },
      },
      orderBy: { Date_Affectation: "desc" },
    });

    const formattedSites = sites.map(liaison => ({
      id_Site: liaison.t_site?.Id_Site,
      code_Site: liaison.t_site?.Code_Site,
      libelle_Site: liaison.t_site?.Libelle_Site,
      archive: liaison.t_site?.Est_Archive,
      assignedAt: liaison.Date_Affectation,
    }));

    return NextResponse.json(formattedSites);
  } catch (error) {
    console.error("Get user sites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user sites" },
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
    const { id_Site } = body;

    if (isNaN(userId) || !id_Site) {
      return NextResponse.json(
        { error: "Invalid user ID or site ID" },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.t_site.findUnique({
      where: { Id_Site: id_Site },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
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
    const existingLiaison = await prisma.t_liaison_utilisateur_site.findUnique({
      where: {
        Id_Utilisateur_Id_Site: {
          Id_Utilisateur: userId,
          Id_Site: id_Site,
        },
      },
    });

    if (existingLiaison) {
      return NextResponse.json(
        { error: "User is already assigned to this site" },
        { status: 409 }
      );
    }

    // Create new liaison
    const liaison = await prisma.t_liaison_utilisateur_site.create({
      data: {
        Id_Utilisateur: userId,
        Id_Site: id_Site,
      },
      select: {
        Id_Site: true,
        Date_Affectation: true,
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Site assigned to user successfully",
      site: {
        id_Site: liaison.t_site?.Id_Site,
        code_Site: liaison.t_site?.Code_Site,
        libelle_Site: liaison.t_site?.Libelle_Site,
        assignedAt: liaison.Date_Affectation,
      },
    });
  } catch (error) {
    console.error("Add site to user error:", error);
    return NextResponse.json(
      { error: "Failed to assign site to user" },
      { status: 500 }
    );
  }
}
