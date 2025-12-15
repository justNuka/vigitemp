import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

const updateSettingSchema = z.object({
  value: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const [section, motCle] = key.split(":");

    const setting = await prisma.t_parametre.findUnique({
      where: { 
        Section_Mot_Cle: {
          Section: section || "",
          Mot_Cle: motCle || key,
        }
      },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      key: `${setting.Section}:${setting.Mot_Cle}`,
      section: setting.Section,
      motCle: setting.Mot_Cle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    });
  } catch (error) {
    console.error("Get setting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { key } = await params;
    const body = await req.json();
    const { value } = updateSettingSchema.parse(body);

    const [section, motCle] = key.split(":");
    const sectionVal = section || "";
    const motCleVal = motCle || key;

    // Get old value for logging
    const oldSetting = await prisma.t_parametre.findUnique({
      where: {
        Section_Mot_Cle: {
          Section: sectionVal,
          Mot_Cle: motCleVal,
        },
      },
    });

    // Upsert the setting
    const setting = await prisma.t_parametre.upsert({
      where: {
        Section_Mot_Cle: {
          Section: sectionVal,
          Mot_Cle: motCleVal,
        },
      },
      update: {
        Valeur: value,
      },
      create: {
        Section: sectionVal,
        Mot_Cle: motCleVal,
        Valeur: value,
      },
    });

    // Log configuration change
    log.config.change(
      key,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      oldSetting?.Valeur || "N/A",
      value
    );

    // Invalider le cache pour forcer le rechargement des settings
    revalidateTag("settings-data", "default");

    return NextResponse.json({
      key: `${setting.Section}:${setting.Mot_Cle}`,
      section: setting.Section,
      motCle: setting.Mot_Cle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Update setting error:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
