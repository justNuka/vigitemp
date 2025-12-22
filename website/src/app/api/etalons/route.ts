import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";

const createEtalonSchema = z.object({
  Etalon_Numero_Serie: z.string().min(1, "Numéro de série requis"),
  Etat_Etalon: z.string().optional(),
  Port_Serie: z.string().optional(),
  Resolution: z.string().optional(),
  Incertitude: z.string().optional(),
  Nb_Decimale: z.number().optional(),
  Reserve_MC2: z.string().optional(),
  Id_Serveur: z.number().optional(),
  Id_Module: z.number().optional(),
  // Certificat
  Numero: z.string().optional(),
  Organisme: z.string().optional(),
  Date: z.string().optional(), // YYYY-MM-DD
  Unite: z.string().optional(),
  // Mesures (tableau)
  mesures: z.array(z.object({
    Numero_Ordre: z.number(),
    Temperature_Reference: z.string(),
    Temperature_Vraie: z.string(),
    Incertitude: z.string(),
  })).optional(),
});

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const etalons = await prisma.t_etalon.findMany({
      select: {
        Id_Etalon: true,
        Etalon_Numero_Serie: true,
        Etat_Etalon: true,
        Port_Serie: true,
        Id_Serveur: true,
        Id_Module: true,
        Resolution: true,
        Incertitude: true,
        Nb_Decimale: true,
        Est_Archive: true,
      },
      where: {
        Est_Archive: false,
      },
      orderBy: {
        Etalon_Numero_Serie: "asc",
      },
    });

    // Récupérer les infos de certificat et mesures pour chaque étalon
    const etalonsWithDetails = await Promise.all(
      etalons.map(async (etalon) => {
        const etalonnage = await prisma.t_etalonnage.findFirst({
          where: {
            Etalon_Numero_Serie: etalon.Etalon_Numero_Serie,
          },
          select: {
            Date_Certif: true,
            Organisme: true,
            Num_Certif: true,
            Unite: true,
          },
          orderBy: {
            Date_Heure_Etalonnage: "desc",
          },
        });

        // Récupérer les mesures associées
        const mesures = etalonnage
          ? await prisma.t_etalonnage_mesure.findMany({
              where: {
                // Pas de relation directe, donc on doit faire une requête séparée
              },
              select: {
                Numero_Ordre: true,
                Mesure_Sonde: true,
                Mesure_Etalon: true,
              },
            })
          : [];

        return {
          ...etalon,
          Date_Certif: etalonnage?.Date_Certif || null,
          Organisme: etalonnage?.Organisme || null,
          Num_Certif: etalonnage?.Num_Certif || null,
          Unite: etalonnage?.Unite || null,
        };
      })
    );

    return NextResponse.json(etalonsWithDetails);
  } catch (error) {
    console.error("Etalons fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des étalons" },
      { status: 500 }
    );
  }
});

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const data = createEtalonSchema.parse(body);

    // Vérifier si l'étalon existe déjà
    const existingEtalon = await prisma.t_etalon.findUnique({
      where: { Etalon_Numero_Serie: data.Etalon_Numero_Serie },
    });

    if (existingEtalon) {
      return NextResponse.json(
        { error: "Un étalon avec ce numéro de série existe déjà" },
        { status: 409 }
      );
    }

    // Créer l'étalon
    const newEtalon = await prisma.t_etalon.create({
      data: {
        Etalon_Numero_Serie: data.Etalon_Numero_Serie,
        Etat_Etalon: data.Etat_Etalon,
        Port_Serie: data.Port_Serie,
        Resolution: data.Resolution,
        Incertitude: data.Incertitude,
        Nb_Decimale: data.Nb_Decimale,
        Reserve_MC2: data.Reserve_MC2,
        Id_Serveur: data.Id_Serveur,
        Id_Module: data.Id_Module,
      },
    });

    // Créer le certificat si les données sont fourni
    if (data.Numero || data.Organisme || data.Date || data.Unite) {
      const certifDate = data.Date ? new Date(data.Date) : null;
      
      const newCertif = await prisma.t_certif.create({
        data: {
          Numero: data.Numero,
          Organisme: data.Organisme,
          Date: certifDate,
          Etalon_Numero_Serie: data.Etalon_Numero_Serie,
          Unite: data.Unite,
        },
      });

      // Créer les mesures
      if (data.mesures && data.mesures.length > 0) {
        await prisma.t_certif_mesure.createMany({
          data: data.mesures.map((m) => ({
            Id_Certif: newCertif.Id_Certif,
            Numero_Ordre: m.Numero_Ordre,
            Temperature_Reference: m.Temperature_Reference,
            Temperature_Vraie: m.Temperature_Vraie,
            Incertitude: parseFloat(m.Incertitude) || null,
          })),
        });
      }
    }

    return NextResponse.json(
      {
        message: "Étalon créé avec succès",
        etalon: newEtalon,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Etalon creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'étalon" },
      { status: 500 }
    );
  }
}
