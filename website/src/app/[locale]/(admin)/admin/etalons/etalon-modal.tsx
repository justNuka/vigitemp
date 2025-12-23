import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEtalonsTypes } from "@/hooks/useEtalonsTypes";
import { useModules } from "@/hooks/useModules";
import { Etalon } from "@/hooks/useEtalons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EtalonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etalon?: Etalon | null;
  isEditing?: boolean;
}

interface MesurePoint {
  point: number;
  reference: string;
  value: string;
  incertitude: string;
}

const UNITE_OPTIONS = [
  { value: "degres", label: "°C" },
  { value: "pascal", label: "Pa" },
  { value: "co2", label: "%CO2" },
  { value: "hr", label: "%HR" },
  { value: "ma", label: "mA" },
  { value: "v", label: "V" },
];

export function EtalonModal({ open, onOpenChange, etalon, isEditing }: EtalonModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Section 1 - Info étalon
  const [type, setType] = useState("");
  const [serie, setSerie] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [portSerie, setPortSerie] = useState("");
  const [idServeur, setIdServeur] = useState("0");
  const [valeurBase, setValeurBase] = useState("0");
  const [resolution, setResolution] = useState("0");
  const [incertitude, setIncertitude] = useState("0");

  // Section 2 - Certificat
  const [organisme, setOrganisme] = useState("");
  const [dateCertif, setDateCertif] = useState("");
  const [unite, setUnite] = useState("");
  const [numeroCertif, setNumeroCertif] = useState("");

  // Section 3 - Tableau mesures
  const [mesures, setMesures] = useState<MesurePoint[]>([]);
  const [selectedMesureIndex, setSelectedMesureIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: types, isLoading: typesLoading } = useEtalonsTypes();
  const { data: modules, isLoading: modulesLoading } = useModules();

  // Initialiser les champs quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      if (isEditing && etalon) {
        setType(etalon.Etalon_Numero_Serie?.substring(0, 2) || "");
        setSerie(etalon.Etalon_Numero_Serie || "");
        setModuleId(etalon.Id_Module?.toString() || "");
        setPortSerie(etalon.Port_Serie || "");
        setIdServeur(etalon.Id_Serveur?.toString() || "0");
        setResolution(etalon.Resolution || "0");
        setIncertitude(etalon.Incertitude || "0");
        setOrganisme(etalon.Organisme || "");
        setDateCertif(etalon.Date_Certif ? etalon.Date_Certif.substring(0, 10) : "");
        setUnite(etalon.Unite || "");
        setNumeroCertif(etalon.Num_Certif || "");
        setMesures([]);
      } else {
        setType("");
        setSerie("");
        setModuleId("");
        setPortSerie("");
        setIdServeur("0");
        setValeurBase("0");
        setResolution("0");
        setIncertitude("0");
        setOrganisme("");
        setDateCertif("");
        setUnite("");
        setNumeroCertif("");
        setMesures([]);
        setSelectedMesureIndex(null);
      }
    }
  }, [open, etalon, isEditing]);

  const handleAddMesure = () => {
    const nextPoint = mesures.length > 0 ? Math.max(...mesures.map(m => m.point)) + 1 : 1;
    setMesures([...mesures, { point: nextPoint, reference: "", value: "", incertitude: "" }]);
    setSelectedMesureIndex(mesures.length);
  };

  const handleUpdateMesure = (index: number, field: string, value: string) => {
    const updated = [...mesures];
    updated[index] = { ...updated[index], [field]: value };
    setMesures(updated);
  };

  const handleDeleteMesure = () => {
    if (selectedMesureIndex !== null) {
      setMesures(mesures.filter((_, i) => i !== selectedMesureIndex));
      setSelectedMesureIndex(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!serie.trim()) {
      toast.error("Veuillez remplir le numéro de série");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        Etalon_Numero_Serie: serie,
        Resolution: resolution,
        Incertitude: incertitude,
        Numero: numeroCertif,
        Organisme: organisme,
        Date: dateCertif,
        Unite: unite,
        mesures: mesures.map((m, index) => ({
          Numero_Ordre: index + 1,
          Temperature_Reference: m.reference,
          Temperature_Vraie: m.value,
          Incertitude: m.incertitude,
        })),
      };

      let response;
      if (isEditing && etalon) {
        response = await fetch(`/api/etalons/${etalon.Id_Etalon}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/etalons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success(
        isEditing
          ? "Étalon mis à jour avec succès"
          : "Étalon créé avec succès"
      );

      // Invalider le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ["etalons"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier l'étalon" : "Créer un étalon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Section 1: Info étalon */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations de l'étalon</h3>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type d'étalon</Label>
                <Select
                  value={type}
                  onValueChange={setType}
                  disabled={isEditing}
                >
                  <SelectTrigger id="type" disabled={typesLoading || isEditing}>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types?.map((t) => (
                      <SelectItem key={t.Type_Etalon} value={t.Type_Etalon || ""}>
                        {t.Type_Etalon} - {t.Nom || "-"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Numéro de série */}
              <div className="space-y-2">
                <Label htmlFor="serie">Numéro de série</Label>
                <Input
                  id="serie"
                  placeholder="Ex: 00001"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value.replace(/\D/g, ""))}
                  readOnly={isEditing}
                  className={isEditing ? "bg-muted opacity-50" : ""}
                />
              </div>

              {/* Module */}
              <div className="space-y-2">
                <Label htmlFor="module">Module</Label>
                <Select
                  value={moduleId}
                  onValueChange={setModuleId}
                >
                  <SelectTrigger id="module" disabled={modulesLoading}>
                    <SelectValue placeholder="Sélectionner un module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules?.map((mod) => (
                      <SelectItem key={mod.Id_Module} value={mod.Id_Module.toString()}>
                        Module sur port {mod.Port_Serie || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Port série */}
              <div className="space-y-2">
                <Label htmlFor="port">Port série</Label>
                <Input
                  id="port"
                  placeholder="Port série"
                  value={portSerie}
                  readOnly
                  className="bg-muted opacity-50"
                />
              </div>

              {/* ID Serveur */}
              <div className="space-y-2">
                <Label htmlFor="server">ID Serveur</Label>
                <Input
                  id="server"
                  placeholder="ID Serveur"
                  value={idServeur}
                  readOnly
                  className="bg-muted opacity-50"
                />
              </div>

              {/* Valeur de base */}
              <div className="space-y-2">
                <Label htmlFor="base-value">Valeur de base</Label>
                <Input
                  id="base-value"
                  type="number"
                  placeholder="0"
                  value={valeurBase}
                  onChange={(e) => setValeurBase(e.target.value)}
                />
              </div>

              {/* Résolution */}
              <div className="space-y-2">
                <Label htmlFor="resolution">Résolution</Label>
                <Input
                  id="resolution"
                  type="number"
                  placeholder="0"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>

              {/* Incertitude */}
              <div className="space-y-2">
                <Label htmlFor="incertitude">Incertitude</Label>
                <Input
                  id="incertitude"
                  type="number"
                  placeholder="0"
                  value={incertitude}
                  onChange={(e) => setIncertitude(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Section 2: Certificat */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Certificat</h3>

              {/* Organisme */}
              <div className="space-y-2">
                <Label htmlFor="organisme">Organisme</Label>
                <Input
                  id="organisme"
                  placeholder="Nom de l'organisme"
                  value={organisme}
                  onChange={(e) => setOrganisme(e.target.value)}
                />
              </div>

              {/* Date certificat */}
              <div className="space-y-2">
                <Label htmlFor="date-certif">Date certificat</Label>
                <Input
                  id="date-certif"
                  type="date"
                  value={dateCertif}
                  onChange={(e) => setDateCertif(e.target.value)}
                />
              </div>

              {/* Unité */}
              <div className="space-y-2">
                <Label htmlFor="unite">Unité</Label>
                <Select value={unite} onValueChange={setUnite}>
                  <SelectTrigger id="unite">
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Numéro certificat */}
              <div className="space-y-2">
                <Label htmlFor="num-certif">Numéro de certificat</Label>
                <Input
                  id="num-certif"
                  placeholder="Numéro de certificat"
                  value={numeroCertif}
                  onChange={(e) => setNumeroCertif(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Section 3: Tableau mesures */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tableau de mesures</h3>

              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted">
                    <TableRow>
                      <TableHead>Point</TableHead>
                      <TableHead>T° référence</TableHead>
                      <TableHead>T° lue</TableHead>
                      <TableHead>Incertitude</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mesures.map((mesure, index) => (
                      <TableRow
                        key={index}
                        onClick={() => setSelectedMesureIndex(index)}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedMesureIndex === index && "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-medium border-l-4 border-l-blue-600 dark:border-l-blue-400"
                        )}
                      >
                        <TableCell>{mesure.point}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={mesure.reference}
                            onChange={(e) => handleUpdateMesure(index, "reference", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={mesure.value}
                            onChange={(e) => handleUpdateMesure(index, "value", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={mesure.incertitude}
                            onChange={(e) => handleUpdateMesure(index, "incertitude", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddMesure} className="bg-green-600 hover:bg-green-700" size="sm">
                  Nouveau
                </Button>
                <Button
                  onClick={() => {
                    if (selectedMesureIndex !== null) {
                      setIsDeleteDialogOpen(true);
                    }
                  }}
                  disabled={selectedMesureIndex === null}
                  variant="outline"
                  size="sm"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la mesure</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce point de mesure ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMesure} className="bg-red-600">
            Supprimer
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
