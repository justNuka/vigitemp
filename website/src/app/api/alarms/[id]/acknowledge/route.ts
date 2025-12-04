import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const acknowledgeSchema = z.object({
  comment: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alarmId = parseInt(id);
    const body = await req.json();
    const { comment } = acknowledgeSchema.parse(body);

    // Get current user from session
    const session = req.cookies.get("session")?.value;
    let userId = 0;
    let userName = "System";

    if (session) {
      const decoded = Buffer.from(session, "base64").toString();
      userId = parseInt(decoded.split(":")[0]);

      const user = await prisma.t_utilisateur.findUnique({
        where: { IdUtilisateur: userId },
        select: { Prenom: true, Nom: true },
      });

      if (user) {
        userName = `${user.Prenom || ""} ${user.Nom || ""}`.trim();
      }
    }

    const alarm = await prisma.t_alarme.update({
      where: { IdAlarme: alarmId },
      data: {
        Acquite: true,
        TelAcquite: true,
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
      status: "acknowledged",
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userName,
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
