import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode session token (simple implementation)
    const decoded = Buffer.from(session, "base64").toString();
    const userId = parseInt(decoded.split(":")[0]);

    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: userId },
      include: {
        t_profil: true,
      },
    });

    if (!user || user.Archive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.IdUtilisateur,
      username: user.Login || "user",
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      role: user.t_profil?.ProfilUtilisateur || "user",
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
