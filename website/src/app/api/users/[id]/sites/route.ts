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
      where: { IdUtilisateur: userId },
      select: {
        IdSite: true,
        DateAffectation: true,
        t_site: {
          select: {
            IdSite: true,
            CodeSite: true,
            LibelleSite: true,
            Archive: true,
          },
        },
      },
      orderBy: { DateAffectation: "desc" },
    });

    const formattedSites = sites.map(liaison => ({
      idSite: liaison.t_site.IdSite,
      codeSite: liaison.t_site.CodeSite,
      libelleSite: liaison.t_site.LibelleSite,
      archive: liaison.t_site.Archive,
      assignedAt: liaison.DateAffectation,
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
    const { idSite } = body;

    if (isNaN(userId) || !idSite) {
      return NextResponse.json(
        { error: "Invalid user ID or site ID" },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.t_site.findUnique({
      where: { IdSite: idSite },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
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
    const existingLiaison = await prisma.t_liaison_utilisateur_site.findUnique({
      where: {
        IdUtilisateur_IdSite: {
          IdUtilisateur: userId,
          IdSite: idSite,
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
        IdUtilisateur: userId,
        IdSite: idSite,
      },
      select: {
        IdSite: true,
        DateAffectation: true,
        t_site: {
          select: {
            IdSite: true,
            CodeSite: true,
            LibelleSite: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Site assigned to user successfully",
      site: {
        idSite: liaison.t_site.IdSite,
        codeSite: liaison.t_site.CodeSite,
        libelleSite: liaison.t_site.LibelleSite,
        assignedAt: liaison.DateAffectation,
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
