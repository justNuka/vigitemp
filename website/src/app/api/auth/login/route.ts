import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = loginSchema.parse(body);

    // Find user by username
    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Login: username,
        Archive: false,
      },
      include: {
        t_profil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a un mot de passe
    if (!user.Mot_de_passe) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec bcrypt
    const passwordValid = await bcrypt.compare(password, user.Mot_de_passe);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.IdUtilisateur,
      username: user.Login || "user",
      role: user.t_profil?.ProfilUtilisateur || "user",
    });

    // Return user data
    const userData = {
      id: user.IdUtilisateur,
      username: user.Login || "user",
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login || "user",
      role: user.t_profil?.ProfilUtilisateur || "user",
      token,
    };

    const response = NextResponse.json(userData);

    // Set JWT cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
