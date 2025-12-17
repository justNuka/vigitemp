"use client";

import { useState } from "react";
import { useSondes } from "@/hooks/useSondes";
import { useCalibrages } from "@/hooks/useCalibrages";
import { useEtalonnages } from "@/hooks/useEtalonnages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Printer } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SondeModal } from "./sonde-modal";

export function SondesClient() {
  const [selectedSonde, setSelectedSonde] = useState<number | null>(null);
  const [selectedCalibrage, setSelectedCalibrage] = useState<number | null>(null);
  const [selectedEtalonnage, setSelectedEtalonnage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: sondes, isLoading: sondesLoading } = useSondes();
  const selectedSondeData = sondes?.find((s) => s.Id_Sonde === selectedSonde);
  const { data: calibrages, isLoading: calibragesLoading } = useCalibrages(
    selectedSondeData?.Sonde_Numero_Serie || null
  );
  const { data: etalonnages, isLoading: etalonnagesLoading } = useEtalonnages(
    selectedSondeData?.Sonde_Numero_Serie || null
  );

  const formatDateTime = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: fr });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: fr });
  };

  if (sondesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sondes Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Sondes ({sondes?.length || 0})</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  setIsEditing(false);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedSonde}
                className="gap-2"
                onClick={() => {
                  setIsEditing(true);
                  setIsModalOpen(true);
                }}
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!sondes || sondes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune sonde
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Numéro de série</TableHead>
                      <TableHead>Port série</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead>Lieu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sondes.map((sonde) => (
                      <TableRow
                        key={sonde.Id_Sonde}
                        onClick={() => {
                          setSelectedSonde(sonde.Id_Sonde);
                          setSelectedCalibrage(null);
                          setSelectedEtalonnage(null);
                        }}
                        className={cn(
                          "cursor-pointer hover:bg-muted transition-colors",
                          selectedSonde === sonde.Id_Sonde && "bg-blue-600 text-white"
                        )}
                      >
                        <TableCell className="font-medium">
                          {sonde.Adresse_Sonde || "-"}
                        </TableCell>
                        <TableCell>{sonde.Sonde_Numero_Serie || "-"}</TableCell>
                        <TableCell>{sonde.Port_Serie || "-"}</TableCell>
                        <TableCell>{sonde.Id_Module || "-"}</TableCell>
                        <TableCell>{sonde.Etat_Sonde || "-"}</TableCell>
                        <TableCell>{sonde.Lieu || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calibrages and Etalonnages - always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calibrages Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Calibrages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {calibragesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !calibrages || calibrages.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Aucun calibrage
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Opérateur</TableHead>
                          <TableHead>Unité</TableHead>
                          <TableHead>Décimales</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calibrages.map((calib) => (
                          <TableRow
                            key={calib.Id_Calibrage}
                            onClick={() => setSelectedCalibrage(calib.Id_Calibrage)}
                            className={cn(
                              "cursor-pointer hover:bg-muted transition-colors",
                              selectedCalibrage === calib.Id_Calibrage && "bg-blue-600 text-white"
                            )}
                          >
                            <TableCell className="text-sm">
                              {formatDateTime(calib.Date_Heure_Calibrage)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {calib.Operateur || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {calib.Unite || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {calib.Nb_Decimale || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedCalibrage}
                    className="flex-1"
                  >
                    Générer fichier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedCalibrage}
                    className="flex-1"
                  >
                    Imprimer
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Etalonnages Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Étalonnages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {etalonnagesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !etalonnages || etalonnages.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Aucun étalonnage
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Validité</TableHead>
                          <TableHead>Opérateur</TableHead>
                          <TableHead>Incertitude</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {etalonnages.map((etal) => (
                          <TableRow
                            key={etal.Id_Etalonnage}
                            onClick={() => setSelectedEtalonnage(etal.Id_Etalonnage)}
                            className={cn(
                              "cursor-pointer hover:bg-muted transition-colors",
                              selectedEtalonnage === etal.Id_Etalonnage && "bg-blue-600 text-white"
                            )}
                          >
                            <TableCell className="text-sm">
                              {formatDateTime(etal.Date_Heure_Etalonnage)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(etal.Date_Validite)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {etal.Operateur || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {etal.Incertitude || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!selectedEtalonnage}
                    className="flex-1"
                  >
                    Supprimer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedEtalonnage}
                    className="flex-1"
                  >
                    Générer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedEtalonnage}
                    className="flex-1"
                  >
                    Imprimer
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sonde Modal */}
      <SondeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        probe={selectedSonde ? sondes?.find(s => s.Id_Sonde === selectedSonde) : null}
        isEditing={isEditing}
      />
    </div>
  );
}
