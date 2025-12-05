import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "user"]).default("user"),
});

export async function GET() {
  try {
    const users = await prisma.t_utilisateur.findMany({
      where: { Archive: false },
      include: {
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          },
        },
      },
      orderBy: { Login: "asc" },
    });

    const formatted = users.map((user: any) => ({
      id: user.IdUtilisateur,
      username: user.Login,
      displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
      role: user.t_profil?.ProfilUtilisateur || "user",
      status: !user.Archive ? "active" : "inactive",
      createdAt: user.Date_Creation?.toISOString() || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    // Check if username already exists
    const existing = await prisma.t_utilisateur.findFirst({
      where: { Login: data.username, Archive: false },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.t_utilisateur.create({
      data: {
        Login: data.username,
        Mot_de_passe: hashedPassword,
        Prenom: data.prenom,
        Nom: data.nom,
        Adresse_Email: data.email,
        ProfilUtilisateur: data.role,
        Archive: false,
        Date_Creation: new Date(),
      },
      include: {
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        id: user.IdUtilisateur,
        username: user.Login,
        displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
        role: user.t_profil?.ProfilUtilisateur || "user",
        status: "active",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
