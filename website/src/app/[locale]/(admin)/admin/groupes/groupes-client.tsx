"use client";

import { useState, useMemo } from "react";
import { useGroupes, Groupe } from "@/hooks/useGroupes";
import { useLieuxGroupe } from "@/hooks/useLieuxGroupe";
import { useUtilisateursGroupe } from "@/hooks/useUtilisateursGroupe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroupeModal } from "./groupe-modal";
import { Printer } from "lucide-react";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupesRow {
  Id_Groupe: number;
  Nom_Groupe: string | null;
  Numero_Regroupement: string | null;
  nombre_lieux: number;
}

interface LieuRow {
  Id_Lieu: number;
  Nom_Lieu: string | null;
}

interface UtilisateurRow {
  Id_Utilisateur: number;
  Nom_Complet: string;
}

export function GroupesClient() {
  const [regroupement, setRegroupement] = useState("1");
  const [selectedGroupe, setSelectedGroupe] = useState<Groupe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchLieux, setSearchLieux] = useState("");
  const [searchUtilisateurs, setSearchUtilisateurs] = useState("");

  const { data: groupes, isLoading } = useGroupes(regroupement);
  const { data: lieux } = useLieuxGroupe(selectedGroupe?.Id_Groupe);
  const { data: utilisateurs } = useUtilisateursGroupe(selectedGroupe?.Id_Groupe);

  // Filtrer les lieux
  const lieuxFiltres = useMemo(() => {
    if (!lieux) return [];
    return lieux.filter((l) =>
      l.Nom_Lieu?.toLowerCase().includes(searchLieux.toLowerCase())
    );
  }, [lieux, searchLieux]);

  // Filtrer les utilisateurs
  const utilisateursFiltres = useMemo(() => {
    if (!utilisateurs) return [];
    return utilisateurs.filter((u) => {
      const fullName = `${u.Prenom || ""} ${u.Nom || ""}`.toLowerCase();
      return fullName.includes(searchUtilisateurs.toLowerCase());
    });
  }, [utilisateurs, searchUtilisateurs]);

  const handleNouveau = () => {
    setSelectedGroupe(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleModifier = () => {
    if (selectedGroupe) {
      setIsEditing(true);
      setModalOpen(true);
    }
  };

  const handleArchiver = () => {
    if (selectedGroupe) {
      console.log("Archiver groupe:", selectedGroupe.Id_Groupe);
      // TODO: Implémentation de l'archivage
    }
  };

  const handleImprimer = () => {
    window.print();
  };

  // Colonnes TanStack pour Groupes
  const groupesColumns: ColumnDef<GroupesRow>[] = [
    {
      accessorKey: "Id_Groupe",
      header: "Numéro",
      cell: ({ row }) => row.getValue("Id_Groupe"),
    },
    {
      accessorKey: "Nom_Groupe",
      header: "Nom du groupe",
      cell: ({ row }) => row.getValue("Nom_Groupe") || "-",
    },
    {
      accessorKey: "Numero_Regroupement",
      header: "Regroupement",
      cell: ({ row }) => {
        const value = row.getValue("Numero_Regroupement");
        return value === "1" ? "Regroupement 1" : "Regroupement 2";
      },
    },
    {
      accessorKey: "nombre_lieux",
      header: "Lieux associés",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue("nombre_lieux")}</div>
      ),
    },
  ];

  const groupesTableData: GroupesRow[] = (groupes || []).map((g) => ({
    Id_Groupe: g.Id_Groupe,
    Nom_Groupe: g.Nom_Groupe,
    Numero_Regroupement: g.Numero_Regroupement,
    nombre_lieux: g.nombre_lieux,
  }));

  const lieuxTableData: LieuRow[] = lieuxFiltres.map((lieu) => ({
    Id_Lieu: lieu.Id_Lieu,
    Nom_Lieu: lieu.Nom_Lieu,
  }));

  const utilisateursTableData: UtilisateurRow[] = utilisateursFiltres.map((user) => ({
    Id_Utilisateur: user.Id_Utilisateur,
    Nom_Complet: `${user.Prenom || ""} ${user.Nom || ""}`.trim(),
  }));

  const lieuxColumns: ColumnDef<LieuRow>[] = [
    {
      accessorKey: "Nom_Lieu",
      header: "Nom du lieu",
      cell: ({ row }) => row.getValue("Nom_Lieu") || "-",
    },
  ];

  const utilisateursColumns: ColumnDef<UtilisateurRow>[] = [
    {
      accessorKey: "Nom_Complet",
      header: "Nom",
      cell: ({ row }) => row.getValue("Nom_Complet") || "-",
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des groupes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {groupes?.length || 0} groupe{groupes && groupes.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={regroupement} onValueChange={setRegroupement}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Regroupement 1</SelectItem>
                <SelectItem value="2">Regroupement 2</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleNouveau} variant="default">
              Nouveau
            </Button>
            <Button
              onClick={handleModifier}
              disabled={!selectedGroupe}
              variant="outline"
            >
              Modifier
            </Button>
            <Button
              onClick={handleArchiver}
              disabled={!selectedGroupe}
              variant="outline"
            >
              Archiver
            </Button>
            <Button onClick={handleImprimer} variant="outline" size="icon" aria-label="Imprimer">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TanStackTable
            columns={groupesColumns}
            data={groupesTableData}
            searchPlaceholder="Numéro, nom du groupe..."
            isLoading={isLoading}
            emptyMessage="Aucun groupe trouvé"
            maxHeight="60vh"
            selectedRowId={selectedGroupe?.Id_Groupe}
            onRowClick={(row: GroupesRow) => {
              const groupe = groupes?.find(g => g.Id_Groupe === row.Id_Groupe);
              if (groupe) setSelectedGroupe(groupe);
            }}
          />
        </CardContent>
      </Card>

      {/* Tables des détails (toujours visibles) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Lieux associés */}
        <div>
          <h3 className="font-semibold mb-3">Lieu(x) associé(s)</h3>
          <Input
            placeholder="Rechercher un lieu..."
            value={searchLieux}
            onChange={(e) => setSearchLieux(e.target.value)}
            className="mb-3"
          />
          <TanStackTable
            columns={lieuxColumns}
            data={lieuxTableData}
            showSearch={false}
            showPagination={false}
            maxHeight="16rem"
            emptyMessage={selectedGroupe ? "Aucun lieu" : "Sélectionnez un groupe"}
          />
        </div>

        {/* Utilisateurs associés */}
        <div>
          <h3 className="font-semibold mb-3">Utilisateur(s) associé(s)</h3>
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchUtilisateurs}
            onChange={(e) => setSearchUtilisateurs(e.target.value)}
            className="mb-3"
          />
          <TanStackTable
            columns={utilisateursColumns}
            data={utilisateursTableData}
            showSearch={false}
            showPagination={false}
            maxHeight="16rem"
            emptyMessage={selectedGroupe ? "Aucun utilisateur" : "Sélectionnez un groupe"}
          />
        </div>
      </div>

      <GroupeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        groupe={selectedGroupe}
        isEditing={isEditing}
      />
    </main>
  );
}
