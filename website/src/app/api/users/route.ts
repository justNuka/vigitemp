import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendEmail, isEmailEnabled } from "@/lib/email";
import AccountCreationEmail from "../../../../emails/email-account-creation";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  email: z.email("Email invalide"),
  profileId: z.string().min(1, "Profil requis"),
  expiryDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
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
    const currentUser = getAuthenticatedUser(req);
    const { ip } = getRequestContext(req);
    
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

    // Store the original password for the email
    const temporaryPassword = data.password;

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
        ProfilUtilisateur: data.profileId,
        Archive: false,
        Date_Creation: new Date(),
        DateDerniereModificationMDP: new Date(),
        Date_Validite: data.expiryDate || null,
        MotDePasseTemporaire: true,
      },
      include: {
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          },
        },
      },
    });

    // Log user creation
    log.data.create(
      "Utilisateur",
      user.IdUtilisateur,
      currentUser?.username || "System",
      currentUser?.userId || 0,
      ip,
      {
        username: user.Login,
        email: user.Adresse_Email,
        profile: user.ProfilUtilisateur,
      }
    );

    // Send account creation email if email is enabled
    if (data.email && await isEmailEnabled()) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
      
      try {
        await sendEmail({
          to: data.email,
          subject: "Votre compte Vigitemp a été créé",
          react: AccountCreationEmail({
            username: data.username,
            temporaryPassword,
            loginUrl,
            firstName: data.prenom,
            lastName: data.nom,
          }),
        });
        console.log(`[Users API] Account creation email sent to ${data.email}`);
      } catch (emailError) {
        console.error("[Users API] Failed to send account creation email:", emailError);
        // Continue anyway - user was created successfully
      }
    }

    // Invalider le cache des utilisateurs
    revalidateTag("users-data", "default");

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
