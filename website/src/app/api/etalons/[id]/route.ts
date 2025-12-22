import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const etalonId = parseInt(resolvedParams.id);

    if (isNaN(etalonId)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'étalon existe
    const existingEtalon = await prisma.t_etalon.findUnique({
      where: { Id_Etalon: etalonId },
    });

    if (!existingEtalon) {
      return NextResponse.json(
        { error: "Étalon introuvable" },
        { status: 404 }
      );
    }

    // Mettre à jour l'étalon
    const updatedEtalon = await prisma.t_etalon.update({
      where: { Id_Etalon: etalonId },
      data: {
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

    // Mettre à jour ou créer le certificat
    if (data.Numero || data.Organisme || data.Date || data.Unite) {
      const certifDate = data.Date ? new Date(data.Date) : null;
      
      // Chercher si un certificat existe déjà
      const existingCertif = await prisma.t_certif.findFirst({
        where: {
          Etalon_Numero_Serie: data.Etalon_Numero_Serie,
        },
      });

      if (existingCertif) {
        // Mettre à jour
        await prisma.t_certif.update({
          where: { Id_Certif: existingCertif.Id_Certif },
          data: {
            Numero: data.Numero,
            Organisme: data.Organisme,
            Date: certifDate,
            Unite: data.Unite,
          },
        });

        // Supprimer les anciennes mesures
        await prisma.t_certif_mesure.deleteMany({
          where: { Id_Certif: existingCertif.Id_Certif },
        });

        // Créer les nouvelles mesures
        if (data.mesures && data.mesures.length > 0) {
          await prisma.t_certif_mesure.createMany({
            data: data.mesures.map((m) => ({
              Id_Certif: existingCertif.Id_Certif,
              Numero_Ordre: m.Numero_Ordre,
              Temperature_Reference: m.Temperature_Reference,
              Temperature_Vraie: m.Temperature_Vraie,
              Incertitude: parseFloat(m.Incertitude) || null,
            })),
          });
        }
      } else {
        // Créer un nouveau certificat
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
    }

    return NextResponse.json({
      message: "Étalon mis à jour avec succès",
      etalon: updatedEtalon,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error._zod },
        { status: 400 }
      );
    }

    console.error("Etalon update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'étalon" },
      { status: 500 }
    );
  }
}
