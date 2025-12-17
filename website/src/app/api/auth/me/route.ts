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

    // Get user's profile and associated authorizations
    let authorizations: Array<{ admin?: boolean }> = [];
    if (user.Profil_Utilisateur) {
      const profil = await prisma.t_profil.findUnique({
        where: { Profil_Utilisateur: user.Profil_Utilisateur },
        include: {
          t_liaison_profil_autorisation: {
            include: {
              t_autorisation: true,
            },
          },
        },
      });

      if (profil) {
        authorizations = profil.t_liaison_profil_autorisation.map((liaison) => ({
          admin: liaison.t_autorisation.A_Acces_Admin || false,
        }));
      }
    }

    return NextResponse.json({
      id: user.Id_Utilisateur,
      username: user.Login || "user",
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      role: user.Profil_Utilisateur || "user",
      authorizations,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
