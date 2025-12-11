"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Composant serveur pour charger les capteurs depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 * Note: Dans cette DB, les "sensors" sont stockés dans t_lieu (lieux)
 */
export async function ServerSensors() {
  "use cache";
  cacheTag("sensors-data");

  const locations = await prisma.t_lieu.findMany({
    where: {
      Archive: false,
    },
    include: {
      t_site: {
        select: {
          IdSite: true,
          CodeSite: true,
          LibelleSite: true,
        },
      },
    },
    orderBy: {
      Nom_Lieu: "asc",
    },
  });

  // Transformation pour l'API client (t_lieu = sensor)
  const formattedSensors = locations.map((lieu) => ({
    id: lieu.IdLieu.toString(),
    name: lieu.Nom_Lieu || "Capteur sans nom",
    type: "temperature", // Type par défaut
    status: mapSensorStatus(lieu.Lieu_Etat),
    currentValue: lieu.DernierValeur !== null ? parseFloat(lieu.DernierValeur.toString()) : null,
    unit: lieu.DernierUnite || "°C",
    minThreshold: lieu.Consigne_Inf ?? 0,
    maxThreshold: lieu.Consigne_Sup ?? 30,
    lastMeasurement: lieu.DernierDateHeure || null,
    isActive: !lieu.Archive,
    // Ajout des champs pour MonitoringCard
    SondeNumeroSerie: lieu.SondeNumeroSerie,
    Lieu_Etat: lieu.Lieu_Etat,
    IdLieu: lieu.IdLieu,
    Frequence: lieu.Frequence,
    location: {
      id: lieu.IdLieu.toString(),
      name: lieu.t_site?.CodeSite && lieu.t_site?.LibelleSite
        ? `${lieu.t_site.CodeSite} - ${lieu.t_site.LibelleSite}`
        : lieu.t_site?.CodeSite || lieu.t_site?.LibelleSite || "Non assigné",
      description: null,
      siteGroup: lieu.t_site?.CodeSite && lieu.t_site?.LibelleSite
        ? `${lieu.t_site.CodeSite} - ${lieu.t_site.LibelleSite}`
        : lieu.t_site?.CodeSite || lieu.t_site?.LibelleSite || null,
      isActive: true,
      // Ajouter les champs nécessaires pour le filtrage
      IdSite: lieu.IdSite,
      IdGroupe1: lieu.IdGroupe1,
      IdGroupe2: lieu.IdGroupe2,
    } as any,
  }));

  return formattedSensors;
}

function mapSensorStatus(etat: string | null): "ok" | "warning" | "critical" | "offline" {
  switch (etat) {
    case "O":
      return "ok";
    case "P":
      return "warning";
    case "A":
      return "critical";
    default:
      return "offline";
  }
}
