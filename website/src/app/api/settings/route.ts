import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.t_parametre.findMany({
      orderBy: { MotCle: "asc" },
    });

    const formatted = settings.map((setting: any) => ({
      key: `${setting.Section}:${setting.MotCle}`,
      section: setting.Section,
      motCle: setting.MotCle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
