import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { prisma } from "@/lib/prisma";

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  sender: string;
}

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier les permissions (Admin seulement)
  if (!user.authorizations?.includes("ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const params = await prisma.t_parametre.findMany({
      where: {
        Section: "SECURITE_EMAIL",
      },
    });

    const config: SMTPConfig = {
      host: "",
      port: 587,
      user: "",
      password: "",
      sender: "noreply@vigitemp.fr",
    };

    params.forEach((param) => {
      switch (param.Mot_Cle) {
        case "SMTP_SERVEUR":
          config.host = param.Valeur || "";
          break;
        case "SMTP_PORT":
          config.port = parseInt(param.Valeur || "587");
          break;
        case "SMTP_UTILISATEUR":
          config.user = param.Valeur || "";
          break;
        case "SMTP_MOT_DE_PASSE":
          config.password = param.Valeur || "";
          break;
        case "SMTP_EXPEDITEUR":
          config.sender = param.Valeur || "noreply@vigitemp.fr";
          break;
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erreur lors de la récupération de la config SMTP:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
});

export const PUT = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier les permissions (Admin seulement)
  if (!user.authorizations?.includes("ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as SMTPConfig;

    // Valider les données
    if (!body.host || !body.port || !body.user || !body.password) {
      return NextResponse.json(
        { error: "Paramètres SMTP incomplets" },
        { status: 400 }
      );
    }

    // Mettre à jour ou créer les paramètres
    const updates = [
      { Mot_Cle: "SMTP_SERVEUR", Valeur: body.host },
      { Mot_Cle: "SMTP_PORT", Valeur: body.port.toString() },
      { Mot_Cle: "SMTP_UTILISATEUR", Valeur: body.user },
      { Mot_Cle: "SMTP_MOT_DE_PASSE", Valeur: body.password },
      { Mot_Cle: "SMTP_EXPEDITEUR", Valeur: body.sender },
    ];

    for (const update of updates) {
      await prisma.t_parametre.upsert({
        where: {
          Section_Mot_Cle: {
            Section: "SECURITE_EMAIL",
            Mot_Cle: update.Mot_Cle,
          },
        },
        update: { Valeur: update.Valeur },
        create: {
          Section: "SECURITE_EMAIL",
          Mot_Cle: update.Mot_Cle,
          Valeur: update.Valeur,
        },
      });
    }

    return NextResponse.json({
      message: "Configuration SMTP mise à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la config SMTP:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
});
