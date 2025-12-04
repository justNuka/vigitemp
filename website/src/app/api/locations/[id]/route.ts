import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
      where: { IdLieu: locationId },
      include: {
        t_sonde: {
          where: { SondeReformee: false },
          select: {
            IdSonde: true,
            SondeNumeroSerie: true,
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
      id: location.IdLieu,
      name: location.Nom_Lieu,
      site: location.IdSite,
      status: location.Lieu_Etat,
      sensors: sondes.map((sensor: any) => ({
        id: sensor.IdSonde,
        serialNumber: sensor.SondeNumeroSerie,
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
    const { id } = await params;
    const locationId = parseInt(id);
    const body = await req.json();
    const data = updateLocationSchema.parse(body);

    const updateData: any = {};
    if (data.name) updateData.Nom_Lieu = data.name;
    if (data.site !== undefined) updateData.IdSite = data.site;

    const location = await prisma.t_lieu.update({
      where: { IdLieu: locationId },
      data: updateData,
    });

    return NextResponse.json({
      id: location.IdLieu,
      name: location.Nom_Lieu,
      site: location.IdSite,
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
