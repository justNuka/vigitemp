import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSensorSchema = z.object({
  name: z.string().optional(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sensorId = parseInt(id);

    const lieu = await prisma.t_lieu.findUnique({
      where: { IdLieu: sensorId },
      include: {
        t_site: {
          select: {
            IdSite: true,
            LibelleSite: true,
          },
        },
      },
    });

    if (!lieu) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: lieu.IdLieu,
      name: lieu.Nom_Lieu,
      status: lieu.Lieu_Etat === "O" ? "ok" : lieu.Lieu_Etat === "P" ? "warning" : lieu.Lieu_Etat === "A" ? "critical" : "offline",
      value: lieu.DernierValeur !== null ? parseFloat(lieu.DernierValeur.toString()) : null,
      unit: lieu.DernierUnite || "°C",
      lastUpdate: lieu.DernierDateHeure?.toISOString() || new Date().toISOString(),
      location: {
        id: lieu.IdSite || 0,
        name: lieu.t_site?.LibelleSite || "Unknown",
      },
      minThreshold: lieu.Consigne_Inf,
      maxThreshold: lieu.Consigne_Sup,
    });
  } catch (error) {
    console.error("Get sensor error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sensor" },
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
    const sensorId = parseInt(id);
    const body = await req.json();
    const data = updateSensorSchema.parse(body);

    const updateData: any = {};
    if (data.name) updateData.Nom_Lieu = data.name;
    if (data.minThreshold !== undefined) updateData.Consigne_Inf = data.minThreshold;
    if (data.maxThreshold !== undefined) updateData.Consigne_Sup = data.maxThreshold;
    if (data.unit) updateData.DernierUnite = data.unit;

    const lieu = await prisma.t_lieu.update({
      where: { IdLieu: sensorId },
      data: updateData,
      include: {
        t_site: {
          select: {
            IdSite: true,
            LibelleSite: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: lieu.IdLieu,
      name: lieu.Nom_Lieu,
      status: lieu.Lieu_Etat === "O" ? "ok" : lieu.Lieu_Etat === "P" ? "warning" : "critical",
      location: {
        id: lieu.IdSite || 0,
        name: lieu.t_site?.LibelleSite || "Unknown",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Update sensor error:", error);
    return NextResponse.json(
      { error: "Failed to update sensor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sensorId = parseInt(id);

    // Soft delete by setting Archive to true
    await prisma.t_lieu.update({
      where: { IdLieu: sensorId },
      data: { Archive: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sensor error:", error);
    return NextResponse.json(
      { error: "Failed to delete sensor" },
      { status: 500 }
    );
  }
}
