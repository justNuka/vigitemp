import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

const updateLocationSchema = z.object({
  name: z.string().optional(),
  site: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const locationId = parseInt(id);

    const location = await prisma.t_lieu.findUnique({
      where: { Id_Lieu: locationId },
      include: {
        t_sonde: {
          where: { Est_Sonde_Reformee: false },
          select: {
            Id_Sonde: true,
            Sonde_Numero_Serie: true,
            Etat_Sonde: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const sondes = Array.isArray(location.t_sonde) ? location.t_sonde : [];
    
    return NextResponse.json({
      id: location.Id_Lieu,
      name: location.Nom_Lieu,
      site: location.Id_Site,
      status: location.Lieu_Etat,
      sensors: sondes.map((sensor: any) => ({
        id: sensor.Id_Sonde,
        serialNumber: sensor.Sonde_Numero_Serie,
        status: sensor.Etat_Sonde,
      })),
    });
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
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
    const locationId = parseInt(id);
    const body = await req.json();
    const data = updateLocationSchema.parse(body);

    const updateData: any = {};
    if (data.name) updateData.Nom_Lieu = data.name;
    if (data.site !== undefined) updateData.Id_Site = data.site;

    const location = await prisma.t_lieu.update({
      where: { Id_Lieu: locationId },
      data: updateData,
    });

    // Log location update
    const changes: any = {};
    if (data.name) changes.name = data.name;
    if (data.site !== undefined) changes.site = data.site;
    
    log.data.update(
      "Lieu",
      locationId,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      changes
    );

    return NextResponse.json({
      id: location.Id_Lieu,
      name: location.Nom_Lieu,
      site: location.Id_Site,
      status: location.Lieu_Etat,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Update location error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
