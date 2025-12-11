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
      where: { IdAlarme: alarmId },
      data: {
        DateHeureFin: new Date(),
      },
      include: {
        t_lieu: {
          select: {
            IdLieu: true,
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
      changes: { resolvedAt: alarm.DateHeureFin },
    });

    return NextResponse.json({
      id: alarm.IdAlarme,
      status: "resolved",
      resolvedAt: alarm.DateHeureFin?.toISOString() || null,
    });
  } catch (error) {
    console.error("Resolve alarm error:", error);
    return NextResponse.json(
      { error: "Failed to resolve alarm" },
      { status: 500 }
    );
  }
}
