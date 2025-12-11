import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

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
    const formatted = locations.map((loc: any) => {
      // Ensure t_sonde is an array
      const sensors = Array.isArray(loc.t_sonde) ? loc.t_sonde : [];
      
      return {
        id: loc.IdLieu,
        name: loc.Nom_Lieu,
        site: loc.IdSite || null,
        status: loc.Lieu_Etat,
        sensorCount: sensors.length,
        okSensors: sensors.filter((s: any) => s.Etat_Sonde === "O").length,
        warningSensors: sensors.filter((s: any) => s.Etat_Sonde === "P").length,
        criticalSensors: sensors.filter((s: any) => s.Etat_Sonde === "A").length,
      };
    });

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
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
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

    // Log location creation
    log.data.create(
      "Lieu",
      location.IdLieu,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      {
        name: data.name,
        site: data.site,
      }
    );

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
