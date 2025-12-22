'use client';

import { useState } from 'react';
import { useLieux, type LieuRow } from '@/hooks/useLieux';
import { useSitesSimple, type SiteSimple } from '@/hooks/useSites';
import { useGroups } from '@/hooks/useGroups';
import { useSondesAvailable } from '@/hooks/useSondesAvailable';
import { TanStackTable } from '@/components/data-table/tanstack-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTypeIcon } from '@/lib/lieu-types';
import { ShineBorder } from "@/components/ui/shine-border";
import { useTheme } from 'next-themes';

export function LieuxClient() {
  const queryClient = useQueryClient();
  const { data: lieux = [], isLoading } = useLieux();
  const { data: sites = [] } = useSitesSimple();
  const { data: groups = [] } = useGroups();
  const { data: sondesAvailable = [] } = useSondesAvailable();
  const [selectedLieu, setSelectedLieu] = useState<LieuRow | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { theme } = useTheme();

  // Form state
  const [formData, setFormData] = useState<any>({
    Nom_Lieu: '',
    Type_Lieu: '', // etuve, bain_marie, ambiance, frigo_congel, autre
    Lieu_Etat: '',
    Id_Site: null,
    Id_Groupe1: null,
    Id_Groupe2: null,
    Sonde_Numero_Serie: '',
    // Consignes
    Consigne: undefined,
    Frequence: undefined,
    Consigne_Sup: undefined,
    Est_Consigne_Sup_Active: false,
    Consigne_Sup_Pre_Alarme: undefined,
    Est_Consigne_Sup_Pre_Alarme_Active: false,
    Retard_Alarme_Haut: undefined,
    Consigne_Inf: undefined,
    Est_Consigne_Inf_Active: false,
    Consigne_Inf_Pre_Alarme: undefined,
    Est_Consigne_Inf_Pre_Alarme_Active: false,
    Retard_Alarme_Bas: undefined,
    // Tolérance de surveillance
    Tolerance_Surveillance_Sup: undefined,
    Tolerance_Surveillance_Inf: undefined,
    // Metrologie fields
    Unite: '°C',
    Erreur_Justesse: undefined,
    Incertitude: undefined,
    Derive: undefined,
    EMT_Mode: 'sans-objet',
    EMT_Valeur: undefined,
    Corriger_Erreur_Justesse: false,
    Prendre_En_Compte_Derive: true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LieuRow>) => {
      const res = await fetch('/api/lieux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur création lieu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lieux'] });
      toast.success('Lieu créé avec succès');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Erreur lors de la création du lieu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<LieuRow>) => {
      const res = await fetch(`/api/lieux/${selectedLieu?.Id_Lieu}?id=${selectedLieu?.Id_Lieu}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur modification lieu');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lieux'] });
      toast.success('Lieu modifié avec succès');
      setIsEditOpen(false);
      setSelectedLieu(null);
    },
    onError: () => {
      toast.error('Erreur lors de la modification du lieu');
    },
  });

  const resetForm = () => {
    setFormData({
      Nom_Lieu: '',
      Lieu_Etat: '',
      Id_Site: null,
      Id_Groupe1: null,
      Id_Groupe2: null,
      Sonde_Numero_Serie: '',
      Consigne: undefined,
      Frequence: undefined,
      Consigne_Sup: undefined,
      Est_Consigne_Sup_Active: false,
      Consigne_Sup_Pre_Alarme: undefined,
      Est_Consigne_Sup_Pre_Alarme_Active: false,
      Retard_Alarme_Haut: undefined,
      Consigne_Inf: undefined,
      Est_Consigne_Inf_Active: false,
      Consigne_Inf_Pre_Alarme: undefined,
      Est_Consigne_Inf_Pre_Alarme_Active: false,
      Retard_Alarme_Bas: undefined,
      Unite: '°C',
      Erreur_Justesse: undefined,
      Incertitude: undefined,
      Derive: undefined,
      EMT_Mode: 'sans-objet',
      EMT_Valeur: undefined,
      Corriger_Erreur_Justesse: false,
      Prendre_En_Compte_Derive: true,
    });
  };

  const handleEdit = () => {
    if (!selectedLieu) return;
    setFormData(selectedLieu);
    setIsEditOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<LieuRow>[] = [
    {
      accessorKey: 'Nom_Lieu',
      header: 'Lieu',
    },
    {
      accessorKey: 'Type_Lieu',
      header: 'Type',
      cell: ({ row }) => {
        const typeValue = row.original.Type_Lieu;
        const { icon, label } = getTypeIcon(typeValue);
        return (
          <div className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 't_groupe1',
      header: 'Groupe 1',
      cell: ({ row }) => row.original.t_groupe1?.Nom_Groupe || '-',
    },
    {
      accessorKey: 't_groupe2',
      header: 'Groupe 2',
      cell: ({ row }) => row.original.t_groupe2?.Nom_Groupe || '-',
    },
    {
      accessorKey: 'Sonde_Numero_Serie',
      header: 'Sonde',
    },
    {
      accessorKey: 'Lieu_Etat',
      header: 'Adresse',
    },
    {
      id: 'etat',
      accessorKey: 'Lieu_Etat',
      header: 'État',
    },
    {
      accessorKey: 'Consigne',
      header: 'Consigne',
      cell: ({ row }) => row.getValue('Consigne') || '-',
    },
    {
      accessorKey: 'Frequence',
      header: 'Unité',
      cell: ({ row }) => row.original.Frequence ? `${row.original.Frequence}mn` : '-',
    },
    {
      accessorKey: 'Consigne_Sup',
      header: 'Max',
    },
    {
      accessorKey: 'Consigne_Inf',
      header: 'Min',
    },
    {
      accessorKey: 'Retard_Alarme_Haut',
      header: 'Retard Alarme Haut (mn)',
    },
    {
      accessorKey: 'Retard_Alarme_Bas',
      header: 'Retard Alarme Bas (mn)',
    },
    {
      id: 'frequence-display',
      accessorKey: 'Frequence',
      header: 'Fréquence (mn)',
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des lieux</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {lieux.length} lieu{lieux.length > 1 ? 'x' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} variant="default">
              Nouveau
            </Button>
            <Button onClick={handleEdit} variant="outline" disabled={!selectedLieu}>
              Modifier
            </Button>
            <Button onClick={handlePrint} variant="ghost" size="icon" disabled={!selectedLieu}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <TanStackTable<LieuRow>
            columns={columns}
            data={lieux}
            searchPlaceholder="Rechercher les lieux..."
            pageSize={15}
            isLoading={isLoading}
            emptyMessage="Aucun lieu trouvé"
            onRowClick={(row) => setSelectedLieu(row)}
            selectedRowId={selectedLieu?.Id_Lieu}
          />
        </CardContent>
      </Card>

      {/* Dialog Création/Modification */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        setIsCreateOpen(false);
        setIsEditOpen(false);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? 'Modifier le lieu' : 'Créer un nouveau lieu'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du lieu
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="metrologie">Métrologie</TabsTrigger>
              <TabsTrigger value="telephonie">Téléphonie/Planning</TabsTrigger>
            </TabsList>

            {/* TAB GENERAL */}
            <TabsContent value="general" className="space-y-4">
              {/* Infos basiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du Lieu</Label>
                  <Input
                    value={formData.Nom_Lieu || ''}
                    onChange={(e) => setFormData({ ...formData, Nom_Lieu: e.target.value })}
                    placeholder="Ex: Stockage A"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de lieu</Label>
                  <Select value={formData.Type_Lieu || ''} onValueChange={(val) =>
                    setFormData({ ...formData, Type_Lieu: val })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="etuve">Étuve</SelectItem>
                      <SelectItem value="bain_marie">Bain Marie</SelectItem>
                      <SelectItem value="ambiance">Ambiance</SelectItem>
                      <SelectItem value="frigo_congel">Frigo/Congel</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Observations / Commentaires</Label>
                  <Input
                    value={formData.Lieu_Etat || ''}
                    onChange={(e) => setFormData({ ...formData, Lieu_Etat: e.target.value })}
                    placeholder="Notes..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Select value={formData.Id_Site?.toString() || ''} onValueChange={(val) =>
                    setFormData({ ...formData, Id_Site: val ? parseInt(val) : null })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites?.map((site) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Groupe 1</Label>
                  <Select value={formData.Id_Groupe1?.toString() || ''} onValueChange={(val) =>
                    setFormData({ ...formData, Id_Groupe1: val ? parseInt(val) : null })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((group) => (
                        <SelectItem key={group.Id_Groupe} value={group.Id_Groupe.toString()}>
                          {group.Nom_Groupe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Groupe 2</Label>
                  <Select value={formData.Id_Groupe2?.toString() || ''} onValueChange={(val) =>
                    setFormData({ ...formData, Id_Groupe2: val ? parseInt(val) : null })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups?.map((group) => (
                        <SelectItem key={group.Id_Groupe} value={group.Id_Groupe.toString()}>
                          {group.Nom_Groupe}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Encadré Sonde */}
              <div className="border p-4 rounded-lg space-y-4 mt-6">
                <h3 className="font-semibold">Sonde</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sélection de sonde</Label>
                    <Select value={formData.Sonde_Numero_Serie || ''} onValueChange={(val) =>
                      setFormData({ ...formData, Sonde_Numero_Serie: val })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une sonde" />
                      </SelectTrigger>
                      <SelectContent>
                        {sondesAvailable?.map((sonde) => (
                          <SelectItem key={sonde.Sonde_Numero_Serie} value={sonde.Sonde_Numero_Serie || ''}>
                            {sonde.Sonde_Numero_Serie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>État de la sonde</Label>
                    <Input disabled placeholder="Automatique" className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Encadré Consignes */}
              <div className="border p-4 rounded-lg space-y-4 mt-6">
                <h3 className="font-semibold">Consignes</h3>
                <div className="space-y-4">
                  {/* Consignes Générales */}
                  <div className="space-y-3 pb-3 border-b">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Consigne</Label>
                        <Input
                          type="number"
                          value={formData.Consigne || ''}
                          onChange={(e) => setFormData({ ...formData, Consigne: parseFloat(e.target.value) || undefined })}
                          placeholder="0.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fréquence de mesure (min)</Label>
                        <Input
                          type="number"
                          value={formData.Frequence || ''}
                          onChange={(e) => setFormData({ ...formData, Frequence: parseInt(e.target.value) || undefined })}
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consigne Supérieure */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.Est_Consigne_Sup_Active || false}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, Est_Consigne_Sup_Active: !!checked })
                        }
                      />
                      <Label className="font-medium">Activation consigne sup</Label>
                    </div>
                    {formData.Est_Consigne_Sup_Active && (
                      <div className="space-y-3 pl-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Maximum</Label>
                            <Input
                              type="number"
                              value={formData.Consigne_Sup || ''}
                              onChange={(e) => setFormData({ ...formData, Consigne_Sup: parseFloat(e.target.value) || undefined })}
                              placeholder="0.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Retard d'alarme (mn)</Label>
                            <Input
                              type="number"
                              value={formData.Retard_Alarme_Haut || ''}
                              onChange={(e) => setFormData({ ...formData, Retard_Alarme_Haut: parseInt(e.target.value) || undefined })}
                              placeholder="5"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, Est_Consigne_Sup_Pre_Alarme_Active: !!checked })
                            }
                          />
                          <Label>Activation consigne sup pré-alarme</Label>
                        </div>
                        {formData.Est_Consigne_Sup_Pre_Alarme_Active && (
                          <div className="space-y-2 pl-6">
                            <Label>Pré-alarme sup.</Label>
                            <Input
                              type="number"
                              value={formData.Consigne_Sup_Pre_Alarme || ''}
                              onChange={(e) => setFormData({ ...formData, Consigne_Sup_Pre_Alarme: parseFloat(e.target.value) || undefined })}
                              placeholder="0.0"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Consigne Inférieure */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.Est_Consigne_Inf_Active || false}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, Est_Consigne_Inf_Active: !!checked })
                        }
                      />
                      <Label className="font-medium">Activation consigne inf</Label>
                    </div>
                    {formData.Est_Consigne_Inf_Active && (
                      <div className="space-y-3 pl-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum</Label>
                            <Input
                              type="number"
                              value={formData.Consigne_Inf || ''}
                              onChange={(e) => setFormData({ ...formData, Consigne_Inf: parseFloat(e.target.value) || undefined })}
                              placeholder="0.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Retard d'alarme (mn)</Label>
                            <Input
                              type="number"
                              value={formData.Retard_Alarme_Bas || ''}
                              onChange={(e) => setFormData({ ...formData, Retard_Alarme_Bas: parseInt(e.target.value) || undefined })}
                              placeholder="5"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, Est_Consigne_Inf_Pre_Alarme_Active: !!checked })
                            }
                          />
                          <Label>Activation consigne inf pré-alarme</Label>
                        </div>
                        {formData.Est_Consigne_Inf_Pre_Alarme_Active && (
                          <div className="space-y-2 pl-6">
                            <Label>Pré-alarme inf.</Label>
                            <Input
                              type="number"
                              value={formData.Consigne_Inf_Pre_Alarme || ''}
                              onChange={(e) => setFormData({ ...formData, Consigne_Inf_Pre_Alarme: parseFloat(e.target.value) || undefined })}
                              placeholder="0.0"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB METROLOGIE */}
            <TabsContent value="metrologie" className="space-y-6">
              {/* Encadré Sonde */}
              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="font-semibold">Sonde</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Numéro de série</Label>
                    <Input disabled value={formData.Sonde_Numero_Serie || ''} className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>État</Label>
                    <Input disabled placeholder="Automatique" className="bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date de calibrage</Label>
                    <Input disabled placeholder="Automatique" className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date d'étalonnage</Label>
                    <Input disabled placeholder="Automatique" className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unité</Label>
                    <Input disabled value={formData.Unite || '°C'} className="bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Erreur de justesse</Label>
                    <Input type="number" step="0.01" disabled value={formData.Erreur_Justesse || ''} className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Incertitude</Label>
                    <Input type="number" step="0.01" disabled value={formData.Incertitude || ''} className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dérive</Label>
                    <Input type="number" step="0.01" disabled value={formData.Derive || ''} className="bg-muted" />
                  </div>
                </div>
              </div>

              {/* Encadré Consignes (readonly) */}
              <div className="border p-3 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900/30">
                <h3 className="font-semibold text-sm">Consignes</h3>
                <div className="space-y-2 text-sm">
                  {formData.Est_Consigne_Sup_Active && (
                    <div className="flex justify-between items-center">
                      <span>Consigne sup. ({formData.Consigne_Sup || '-'})</span>
                      <span className="text-muted-foreground">Tolérance de surveillance supérieure</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.Tolerance_Surveillance_Sup || ''}
                        onChange={(e) => setFormData({ ...formData, Tolerance_Surveillance_Sup: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        className="w-24 h-8"
                      />
                    </div>
                  )}
                  {formData.Est_Consigne_Inf_Active && (
                    <div className="flex justify-between items-center">
                      <span>Consigne inf. ({formData.Consigne_Inf || '-'})</span>
                      <span className="text-muted-foreground">Tolérance de surveillance inférieure</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.Tolerance_Surveillance_Inf || ''}
                        onChange={(e) => setFormData({ ...formData, Tolerance_Surveillance_Inf: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        className="w-24 h-8"
                      />
                    </div>
                  )}
                  {!formData.Est_Consigne_Sup_Active && !formData.Est_Consigne_Inf_Active && (
                    <p className="text-muted-foreground">Aucune consigne configurée</p>
                  )}
                </div>
              </div>

              {/* Encadré EMT */}
              <div className="border p-4 rounded-lg space-y-4">
                <h3 className="font-semibold">EMT (Erreur Maximale Tolérée)</h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="emt_mode"
                      value="quart"
                      checked={formData.EMT_Mode === 'quart'}
                      onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Les EMT obéissent à la règle du quart</div>
                      <div className="text-sm text-muted-foreground">L'EMT de la sonde de surveillance est fixé par défaut au quart de l'EMT</div>
                      {formData.EMT_Mode === 'quart' && (
                        <div className="mt-2 space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Nombre à 2 décimales"
                            value={formData.EMT_Valeur || ''}
                            onChange={(e) => setFormData({ ...formData, EMT_Valeur: parseFloat(e.target.value) || undefined })}
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="emt_mode"
                      value="manuel"
                      checked={formData.EMT_Mode === 'manuel'}
                      onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">EMT saisie manuellement</div>
                      <div className="text-sm text-muted-foreground">En saisie manuelle, l'EMT de la sonde de surveillance doit être inférieur ou égal au quart de l'EMT de l'équipement</div>
                      {formData.EMT_Mode === 'manuel' && (
                        <div className="mt-2 space-y-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Nombre à 2 décimales"
                            value={formData.EMT_Valeur || ''}
                            onChange={(e) => setFormData({ ...formData, EMT_Valeur: parseFloat(e.target.value) || undefined })}
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="emt_mode"
                      value="uncertainties"
                      checked={formData.EMT_Mode === 'uncertainties'}
                      onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">Avec prise en compte des incertitudes d'utilisation</div>
                      <div className="text-sm text-muted-foreground">Les incertitudes d'utilisation sont calculées lors de l'étalonnage de la sonde utilisée, elles diffèrent pour chaque sonde</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="emt_mode"
                      value="sans-objet"
                      checked={formData.EMT_Mode === 'sans-objet'}
                      onChange={(e) => setFormData({ ...formData, EMT_Mode: e.target.value })}
                      className="mt-1"
                    />
                    <div className="font-medium">Sans objet</div>
                  </label>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.Corriger_Erreur_Justesse || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, Corriger_Erreur_Justesse: !!checked })
                    }
                  />
                  <span>Corriger l'erreur de justesse</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.Prendre_En_Compte_Derive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, Prendre_En_Compte_Derive: !!checked })
                    }
                  />
                  <span>Prendre en compte la dérive dans l'incertitude</span>
                </label>
              </div>
            </TabsContent>

            {/* TAB TELEPHONIE/PLANNING */}
            <TabsContent value="telephonie" className="space-y-6">
              <div className="border p-12 rounded-lg text-center">
                <p className="text-muted-foreground">Cette section n'est pas disponible pour les licences light. Veuillez contacter le service commercial MC2 pour faire une upgrade de votre licence actuelle vers une licence standard ou expert.</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setIsEditOpen(false);
            }}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (isEditOpen) {
                  updateMutation.mutate(formData);
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
