import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/connected-users
 * Retourne les utilisateurs connectés (dernière connexion récente)
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer les utilisateurs connectés (dernière connexion dans les dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const connectedUsers = await prisma.t_utilisateur.findMany({
      where: {
        Est_Archive: false,
        Date_Heure_Derniere_Connexion: {
          gte: oneDayAgo,
        },
      },
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
      take: 50,
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

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching connected users:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected users" },
      { status: 500 }
    );
  }
}
