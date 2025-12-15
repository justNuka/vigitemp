import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

const createSensorSchema = z.object({
  name: z.string().min(1, "Name required"),
  locationId: z.number(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");

    const where: any = { Est_Archive: false };

    if (locationId) {
      where.Id_Site = parseInt(locationId);
    }

    if (status && status !== "all") {
      // Map status: ok->O, warning->P, critical->A
      if (status === "ok") where.Lieu_Etat = "O";
      else if (status === "warning") where.Lieu_Etat = "P";
      else if (status === "critical") where.Lieu_Etat = "A";
    }

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    });

    // Transform to API format (locations = sensors in Light UI)
    const formatted = locations.map((lieu: any) => ({
      id: lieu.Id_Lieu,
      name: lieu.Nom_Lieu || "Lieu sans nom",
      status: lieu.Lieu_Etat === "O" ? "ok" : lieu.Lieu_Etat === "P" ? "warning" : lieu.Lieu_Etat === "A" ? "critical" : "offline",
      value: lieu.DernierValeur !== null ? parseFloat(lieu.DernierValeur.toString()) : null,
      unit: lieu.DernierUnite || "°C",
      lastUpdate: lieu.DernierDateHeure?.toISOString() || new Date().toISOString(),
      location: {
        id: lieu.Id_Site || 0,
        name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        siteGroup: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || null,
      },
      minThreshold: lieu.Consigne_Inf,
      maxThreshold: lieu.Consigne_Sup,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get sensors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sensors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const body = await req.json();
    const data = createSensorSchema.parse(body);

    const lieu = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: data.name,
        Id_Site: data.locationId,
        Consigne_Inf: data.minThreshold,
        Consigne_Sup: data.maxThreshold,
        DernierUnite: data.unit || "°C",
        Est_Archive: false,
        Lieu_Etat: "O", // O = OK by default
      },
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

    // Log sensor creation
    log.data.create(
      "Capteur",
      lieu.Id_Lieu,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      {
        name: data.name,
        locationId: data.locationId,
        minThreshold: data.minThreshold,
        maxThreshold: data.maxThreshold,
      }
    );

    return NextResponse.json(
      {
        id: lieu.Id_Lieu,
        name: lieu.Nom_Lieu,
        status: "ok",
        location: {
          id: lieu.t_site?.Id_Site || 0,
          name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
            ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
            : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        },
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

    console.error("Create sensor error:", error);
    return NextResponse.json(
      { error: "Failed to create sensor" },
      { status: 500 }
    );
  }
}
