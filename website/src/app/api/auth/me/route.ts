import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId;

    // Get user from database
    const user = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
    });

    if (!user || user.Est_Archive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.Id_Utilisateur,
      username: user.Login || "user",
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      role: user.Profil_Utilisateur || "user",
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
