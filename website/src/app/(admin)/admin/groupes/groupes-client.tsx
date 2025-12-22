"use client";

import { useState, useMemo } from "react";
import { useGroupes, Groupe } from "@/hooks/useGroupes";
import { useLieuxGroupe } from "@/hooks/useLieuxGroupe";
import { useUtilisateursGroupe } from "@/hooks/useUtilisateursGroupe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GroupeModal } from "./groupe-modal";
import { Printer, Plus, PencilIcon, ArchiveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupesRow {
  Id_Groupe: number;
  Nom_Groupe: string | null;
  Numero_Regroupement: string | null;
  nombre_lieux: number;
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
  }));;

  return (
    <>
      {/* Sélecteur de regroupement */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium">Regroupement:</span>
        <Select value={regroupement} onValueChange={setRegroupement}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Numéro 1</SelectItem>
            <SelectItem value="2">Numéro 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Boutons */}
      <div className="flex gap-2 mb-6">
        <Button onClick={handleNouveau} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
        <Button
          onClick={handleModifier}
          disabled={!selectedGroupe}
          variant="outline"
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button
          onClick={handleArchiver}
          disabled={!selectedGroupe}
          variant="outline"
        >
          <ArchiveIcon className="w-4 h-4 mr-2" />
          Archiver
        </Button>
        <Button onClick={handleImprimer} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Table des groupes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Groupes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TanStackTable
            columns={groupesColumns}
            data={groupesTableData}
            searchPlaceholder="Numéro, nom du groupe..."
            isLoading={isLoading}
            emptyMessage="Aucun groupe trouvé"
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
          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead>Nom du lieu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lieuxFiltres && lieuxFiltres.length > 0 ? (
                  lieuxFiltres.map((lieu) => (
                    <TableRow key={lieu.Id_Lieu}>
                      <TableCell>{lieu.Nom_Lieu}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground text-sm py-2">
                      {selectedGroupe ? "Aucun lieu" : "Sélectionnez un groupe"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  <TableHead>Nom</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utilisateursFiltres && utilisateursFiltres.length > 0 ? (
                  utilisateursFiltres.map((user) => (
                    <TableRow key={user.Id_Utilisateur}>
                      <TableCell>
                        {user.Prenom} {user.Nom}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground text-sm py-2">
                      {selectedGroupe ? "Aucun utilisateur" : "Sélectionnez un groupe"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <GroupeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        groupe={selectedGroupe}
        isEditing={isEditing}
      />
    </>
  );
}
