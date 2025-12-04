import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createLocationSchema = z.object({
  name: z.string().min(1, "Name required"),
  site: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const site = searchParams.get("site");

    const where: any = { Archive: false };

    if (site) {
      where.IdSite = parseInt(site);
    }

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: {
          where: { SondeReformee: false },
          select: {
            IdSonde: true,
            Etat_Sonde: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    });

    // Transform to API format
    const formatted = locations.map((loc: any) => ({
      id: loc.IdLieu,
      name: loc.Nom_Lieu,
      site: loc.IdSite || null,
      status: loc.Lieu_Etat,
      sensorCount: loc.t_sonde?.length || 0,
      okSensors: loc.t_sonde?.filter((s: any) => s.Etat_Sonde === "O").length || 0,
      warningSensors: loc.t_sonde?.filter((s: any) => s.Etat_Sonde === "P").length || 0,
      criticalSensors: loc.t_sonde?.filter((s: any) => s.Etat_Sonde === "A").length || 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createLocationSchema.parse(body);

    const location = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: data.name,
        IdSite: data.site ? parseInt(data.site) : null,
        Archive: false,
        Lieu_Etat: "O",
      },
    });

    return NextResponse.json(
      {
        id: location.IdLieu,
        name: location.Nom_Lieu,
        site: location.IdSite,
        status: location.Lieu_Etat,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Create location error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
