import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
