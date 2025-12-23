import { prisma } from "@/lib/prisma";

export interface Site {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  category?: string; // "1" or "2" pour distinguer groupe1 vs groupe2
}

/**
 * Charge les sites et groupes disponibles (côté serveur)
 */
export async function ServerFilterOptions() {
  try {
    // Récupérer les sites
    const sitesData = await prisma.t_site.findMany({
      select: {
        Id_Site: true,
        Libelle_Site: true,
      },
      orderBy: {
        Libelle_Site: "asc",
      },
    });

    const sites: Site[] = sitesData.map((s) => ({
      id: s.Id_Site,
      name: s.Libelle_Site || `Site ${s.Id_Site}`,
    }));

    // Récupérer les groupes uniques de la table t_groupe
    // Les lieux peuvent avoir Id_Groupe1 et Id_Groupe2 qui référencent cette table
    const groupeData = await prisma.t_groupe.findMany({
      select: {
        Id_Groupe: true,
        Nom_Groupe: true,
        Numero_Regroupement: true,
      },
      orderBy: {
        Nom_Groupe: "asc",
      },
      where: {
        Est_Archive: false, // Exclure les groupes archivés
      },
    });

    const groups: Group[] = groupeData.map((g) => ({
      id: g.Id_Groupe,
      name: g.Nom_Groupe || `Groupe ${g.Id_Groupe}`,
      category: g.Numero_Regroupement || undefined,
    }));

    return { sites, groups };
  } catch (error) {
    console.error("Error loading filter options:", error);
    return { sites: [], groups: [] };
  }
}
