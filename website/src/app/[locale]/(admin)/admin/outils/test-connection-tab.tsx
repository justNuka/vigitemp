"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - à remplacer par des vraies données
const MOCK_PROBES = [
  {
    Id_Sonde: 1,
    Sonde_Numero_Serie: "SONDE001",
    Adresse_Sonde: "192.168.1.10",
    Port_Serie: "COM1",
    Module: "MOD-001",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "ok",
    Taux_Reponse: 98.5,
  },
  {
    Id_Sonde: 2,
    Sonde_Numero_Serie: "SONDE002",
    Adresse_Sonde: "192.168.1.11",
    Port_Serie: "COM2",
    Module: "MOD-002",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "warning",
    Taux_Reponse: 92.0,
  },
  {
    Id_Sonde: 3,
    Sonde_Numero_Serie: "SONDE003",
    Adresse_Sonde: "192.168.1.12",
    Port_Serie: "COM3",
    Module: "MOD-003",
    Relai_1: "Relai_1",
    Relai_2: "Relai_2",
    Relai_3: "Relai_3",
    Relai_4: "Relai_4",
    Signal_Lu: "error",
    Taux_Reponse: 45.0,
  },
];

type ProbeRow = typeof MOCK_PROBES[0];

interface ProbeWithSelection extends ProbeRow {
  selected?: boolean;
}

export function TestConnectionTab() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [probes, setProbes] = useState<ProbeWithSelection[]>(MOCK_PROBES);
  const [isLoading, setIsLoading] = useState(false);

  const globalResponseRate = useMemo(() => {
    if (probes.length === 0) return 0;
    const avg = probes.reduce((sum, p) => sum + p.Taux_Reponse, 0) / probes.length;
    return Math.round(avg * 10) / 10;
  }, [probes]);

  const lastMeasurementCount = useMemo(() => {
    return probes.length * 125; // Mock: 125 mesures par sonde
  }, [probes]);

  const handleSelectAll = () => {
    if (selectedIds.length === probes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(probes.map((p) => p.Id_Sonde));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleReset = () => {
    setSelectedIds([]);
    setProbes(MOCK_PROBES);
  };

  const handleLaunchTests = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      // API call would go here
      console.log("Launching tests for probes:", selectedIds);
      // Simulated response
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<ProbeWithSelection>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedIds.length === probes.length && probes.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Sélectionner toutes les sondes"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.Id_Sonde)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedIds([...selectedIds, row.original.Id_Sonde]);
            } else {
              setSelectedIds(selectedIds.filter((id) => id !== row.original.Id_Sonde));
            }
          }}
          aria-label={`Sélectionner ${row.original.Sonde_Numero_Serie}`}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: "Sonde",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.Sonde_Numero_Serie}</div>
      ),
    },
    {
      accessorKey: "Module",
      header: "Module",
    },
    {
      accessorKey: "Relai_1",
      header: "Relai 1",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_1}</span>
      ),
    },
    {
      accessorKey: "Relai_2",
      header: "Relai 2",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_2}</span>
      ),
    },
    {
      accessorKey: "Relai_3",
      header: "Relai 3",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_3}</span>
      ),
    },
    {
      accessorKey: "Relai_4",
      header: "Relai 4",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.Relai_4}</span>
      ),
    },
    {
      accessorKey: "Signal_Lu",
      header: "Signal lu",
      cell: ({ row }) => {
        const status = row.original.Signal_Lu;
        const config: Record<string, { icon: React.ReactNode; variant: any; label: string }> = {
          ok: {
            icon: <CheckCircle2 className="h-4 w-4" />,
            variant: "outline",
            label: "OK",
          },
          warning: {
            icon: <AlertTriangle className="h-4 w-4" />,
            variant: "secondary",
            label: "Attention",
          },
          error: {
            icon: <Zap className="h-4 w-4" />,
            variant: "destructive",
            label: "Erreur",
          },
        };

        const c = config[status] || config.ok;
        return (
          <Badge variant={c.variant as any} className="gap-1 whitespace-nowrap">
            {c.icon}
            {c.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "Taux_Reponse",
      header: () => <div className="text-right">Taux réponse</div>,
      cell: ({ row }) => {
        const rate = row.original.Taux_Reponse;
        const color =
          rate >= 95 ? "text-green-600" : rate >= 80 ? "text-yellow-600" : "text-red-600";

        return (
          <div className={cn("text-right font-medium", color)}>
            {rate.toFixed(1)}%
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-black dark:border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de réponse global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{globalResponseRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {probes.length} sondes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black dark:border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nombre de mesures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{lastMeasurementCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  dernières 24h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black dark:border-black">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sondes sélectionnées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{selectedIds.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {probes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-black dark:border-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Sondes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {probes.length} sonde{probes.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={handleLaunchTests}
            disabled={selectedIds.length === 0 || isLoading}
            size="sm"
          >
            {isLoading ? "Test en cours..." : "Lancer les tests"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TanStackTable
              columns={columns}
              data={probes}
              pageSize={20}
              isLoading={isLoading}
              emptyMessage="Aucune sonde disponible"
              showSearch={true}
              searchPlaceholder="Rechercher une sonde..."
              searchField={["Sonde_Numero_Serie", "Adresse_Sonde", "Module"]}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.length === probes.length && probes.length > 0
                  ? "Tout décocher"
                  : "Tout cocher"}
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  Décocher la sélection
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Réinitialiser états
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
