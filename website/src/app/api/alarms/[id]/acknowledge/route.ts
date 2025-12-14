import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";

const acknowledgeSchema = z.object({
  comment: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
    const { id } = await params;
    const alarmId = parseInt(id);
    const body = await req.json();
    const { comment } = acknowledgeSchema.parse(body);

    const alarm = await prisma.t_alarme.update({
      where: { Id_Alarme: alarmId },
      data: {
        Acquitee: true,
        Tel_Acquitee: true,
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

    // Log alarm acknowledgement (code ACQ from audit table)
    log.alarm.acknowledge(
      alarm.t_lieu?.Nom_Lieu || "Unknown",
      alarm.t_lieu?.Id_Lieu || 0,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      comment || "Alarme acquittée"
    );

    return NextResponse.json({
      id: alarm.Id_Alarme,
      status: "acknowledged",
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: currentUser?.username || "System",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Acknowledge alarm error:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge alarm" },
      { status: 500 }
    );
  }
}
