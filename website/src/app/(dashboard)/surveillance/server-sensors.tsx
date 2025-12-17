"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "../../../lib/prisma";

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
      Est_Archive: false,
    },
    include: {
      t_site: {
        select: {
          Id_Site: true,
          Code_Site: true,
          Libelle_Site: true,
        },
      },
    },
    orderBy: {
      Nom_Lieu: "asc",
    },
  });

  // Transformation pour l'API client (t_lieu = sensor)
  const formattedSensors = locations.map((lieu) => ({
    id: lieu.Id_Lieu.toString(),
    name: lieu.Nom_Lieu || "Capteur sans nom",
    type: "temperature", // Type par défaut
    status: mapSensorStatus(lieu.Lieu_Etat),
    currentValue: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
    unit: lieu.Derniere_Unite || "°C",
    minThreshold: lieu.Consigne_Inf ?? 0,
    maxThreshold: lieu.Consigne_Sup ?? 30,
    lastMeasurement: lieu.Derniere_Date_Heure || null,
    isActive: !lieu.Est_Archive,
    // Ajout des champs pour MonitoringCard
    SondeNumeroSerie: lieu.Sonde_Numero_Serie,
    Lieu_Etat: lieu.Lieu_Etat,
    IdLieu: lieu.Id_Lieu,
    Frequence: lieu.Frequence,
    location: {
      id: lieu.Id_Lieu.toString(),
      name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
        ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
        : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Non assigné",
      description: null,
      siteGroup: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
        ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
        : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || null,
      isActive: true,
      // Ajouter les champs nécessaires pour le filtrage
      Id_Site: lieu.Id_Site,
      Id_Groupe1: lieu.Id_Groupe1,
      Id_Groupe2: lieu.Id_Groupe2,
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
