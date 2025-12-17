import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

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
      where: { Id_Lieu: sensorId },
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
    });

    if (!lieu) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: lieu.Id_Lieu,
      name: lieu.Nom_Lieu,
      status: lieu.Lieu_Etat === "O" ? "ok" : lieu.Lieu_Etat === "P" ? "warning" : lieu.Lieu_Etat === "A" ? "critical" : "offline",
      value: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
      unit: lieu.Derniere_Unite || "°C",
      lastUpdate: lieu.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
      location: {
        id: lieu.Id_Site || 0,
        name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
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
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
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
      where: { Id_Lieu: sensorId },
      data: updateData,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
    });

    // Log sensor update
    const changes: any = {};
    if (data.name) changes.name = data.name;
    if (data.minThreshold !== undefined) changes.minThreshold = data.minThreshold;
    if (data.maxThreshold !== undefined) changes.maxThreshold = data.maxThreshold;
    if (data.unit) changes.unit = data.unit;
    
    log.data.update(
      "Capteur",
      sensorId,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      changes
    );

    return NextResponse.json({
      id: lieu.Id_Lieu,
      name: lieu.Nom_Lieu,
      status: lieu.Lieu_Etat === "O" ? "ok" : lieu.Lieu_Etat === "P" ? "warning" : "critical",
      location: {
        id: lieu.Id_Site || 0,
        name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
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
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { id } = await params;
    const sensorId = parseInt(id);

    // Get sensor info before deletion
    const sensorToDelete = await prisma.t_lieu.findUnique({
      where: { Id_Lieu: sensorId },
      select: { Nom_Lieu: true },
    });

    // Soft delete by setting Est_Archive to true
    await prisma.t_lieu.update({
      where: { Id_Lieu: sensorId },
      data: { Est_Archive: true },
    });

    // Log sensor deletion
    log.data.delete(
      "Capteur",
      sensorId,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      `Archive du capteur ${sensorToDelete?.Nom_Lieu || sensorId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete sensor error:", error);
    return NextResponse.json(
      { error: "Failed to delete sensor" },
      { status: 500 }
    );
  }
}
