import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { id } = await params;
    const alarmId = parseInt(id);

    const alarm = await prisma.t_alarme.update({
      where: { Id_Alarme: alarmId },
      data: {
        Date_Heure_Fin: new Date(),
      },
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
          },
        },
      },
    });

    // Log alarm resolution
    log.audit("ALARM_RESOLVED", {
      user: currentUser?.username || "System",
      userId: currentUser?.userId || 0,
      ip,
      resource: `Alarme: ${alarm.t_lieu?.Nom_Lieu || "Unknown"}`,
      resourceId: alarmId,
      changes: { resolvedAt: alarm.Date_Heure_Fin },
    });

    return NextResponse.json({
      id: alarm.Id_Alarme,
      status: "resolved",
      resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
    });
  } catch (error) {
    console.error("Resolve alarm error:", error);
    return NextResponse.json(
      { error: "Failed to resolve alarm" },
      { status: 500 }
    );
  }
}
