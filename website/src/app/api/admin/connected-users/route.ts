import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/connected-users
 * Retourne les utilisateurs connectés (dernière connexion récente)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 10);
    const skip = (page - 1) * limit;
    // Récupérer les utilisateurs connectés (dernière connexion dans les dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const where = {
      Est_Archive: false,
      Date_Heure_Derniere_Connexion: {
        gte: oneDayAgo,
      },
    };

    const totalCount = await prisma.t_utilisateur.count({ where });
    const total = Math.min(totalCount, 50);

    if (skip >= total) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      });
    }

    const connectedUsers = await prisma.t_utilisateur.findMany({
      where,
      select: {
        Id_Utilisateur: true,
        Login: true,
        Nom: true,
        Prenom: true,
        Adresse_IP_Connexion: true,
        Profil_Utilisateur: true,
        Date_Heure_Derniere_Connexion: true,
      },
      orderBy: {
        Date_Heure_Derniere_Connexion: "desc",
      },
      skip,
      take: Math.min(limit, 50 - skip),
    });

    // Formater les données
    const formatted = connectedUsers.map((user) => ({
      id: user.Id_Utilisateur,
      login: user.Login || "Unknown",
      nom: user.Nom || "",
      prenom: user.Prenom || "",
      poste: user.Profil_Utilisateur || "Unknown",
      ip: user.Adresse_IP_Connexion || "Unknown",
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching connected users:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected users" },
      { status: 500 }
    );
  }
}
