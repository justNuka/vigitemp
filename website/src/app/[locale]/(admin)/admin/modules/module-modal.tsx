"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModuleTypes, useModuleSondes } from "@/hooks/useModules";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

interface ModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: { Id_Module: number; Module_Numero_Serie: string | null; Type_Module: number | null; Port_Serie: string | null; Emplacement: string | null; Adresse_IP?: string | null; Id_Serveur?: number | null; Delai_Reseau?: number | null } | null;
  onSuccess?: () => void;
}

interface SondeAssocieeRow {
  Id_Sonde: number;
  Type: string;
  Sonde_Numero_Serie: string | null;
}

const createModuleSchema = z.object({
  Module_Numero_Serie: z
    .string()
    .min(1, "Numéro de série est requis")
    .max(50, "Maximum 50 caractères"),
  Type_Module: z.string().min(1, "Type est requis"),
  Port_Serie: z
    .number()
    .int("Doit être un nombre entier")
    .min(1, "Minimum 1")
    .max(255, "Maximum 255"),
  Emplacement: z
    .string()
    .min(1, "Emplacement est requis")
    .max(50, "Maximum 50 caractères"),
  // Section avancée (optionnelle)
  Adresse_IP: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\d{1,3}\.){3}\d{1,3}$/.test(val),
      "Adresse IP invalide"
    ),
  Id_Serveur: z.string().optional(),
  Delai_Reseau: z.number().optional(),
});

type CreateModuleInput = z.infer<typeof createModuleSchema>;

export function ModuleModal({
  open,
  onOpenChange,
  module,
  onSuccess,
}: ModuleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { data: moduleTypes, isLoading: typesLoading } = useModuleTypes();
  const { data: sondes, isLoading: sondesLoading } = useModuleSondes(module?.Id_Module || null);
  const isEditing = !!module;

  const sondesAssocieesColumns: ColumnDef<SondeAssocieeRow>[] = [
    {
      accessorKey: "Type",
      header: "Type",
      cell: ({ row }) => row.getValue("Type") || "-",
    },
    {
      accessorKey: "Sonde_Numero_Serie",
      header: "Numéro de série",
      cell: ({ row }) => row.getValue("Sonde_Numero_Serie") || "-",
    },
  ];

  const sondesAssocieesTableData: SondeAssocieeRow[] = (sondes || []).map((sonde) => ({
    Id_Sonde: sonde.Id_Sonde,
    Type: "-",
    Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
  }));

  const form = useForm<CreateModuleInput>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      Module_Numero_Serie: module?.Module_Numero_Serie || "",
      Type_Module: module?.Type_Module ? String(module.Type_Module) : "",
      Port_Serie: module?.Port_Serie ? parseInt(module.Port_Serie) : 1,
      Emplacement: module?.Emplacement || "",
      Adresse_IP: module?.Adresse_IP || "",
      Id_Serveur: module?.Id_Serveur ? String(module.Id_Serveur) : "",
      Delai_Reseau: module?.Delai_Reseau || undefined,
    },
  });

  const onSubmit = async (data: CreateModuleInput) => {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/modules/${module.Id_Module}` : "/api/modules";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Module_Numero_Serie: data.Module_Numero_Serie,
          Type_Module: parseInt(data.Type_Module),
          Port_Serie: String(data.Port_Serie),
          Emplacement: data.Emplacement,
          Adresse_IP: data.Adresse_IP || null,
          Id_Serveur: data.Id_Serveur ? parseInt(data.Id_Serveur) : null,
          Delai_Reseau: data.Delai_Reseau || null,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur sauvegarde module:", error);
      form.setError("root", {
        message: "Erreur lors de la sauvegarde du module",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le module" : "Créer un nouveau module"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Mettez à jour les informations du module"
              : "Remplissez les informations du module"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Numéro de série */}
            <FormField
              control={form.control}
              name="Module_Numero_Serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de série</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: MOD-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="Type_Module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger disabled={typesLoading}>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {moduleTypes?.map((type) => (
                        <SelectItem
                          key={type.Id_Module_Type}
                          value={String(type.Id_Module_Type)}
                        >
                          {type.Libelle_Type_Module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Port série */}
            <FormField
              control={form.control}
              name="Port_Serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port série (1-255)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="255"
                      placeholder="ex: 1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emplacement */}
            <FormField
              control={form.control}
              name="Emplacement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emplacement</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Salle serveur 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section avancée */}
            <Card className="border-dashed">
              <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Options avancées</CardTitle>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isAdvancedOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </CardHeader>

              {isAdvancedOpen && (
                <CardContent className="space-y-4">
                  {/* Adresse IP */}
                  <FormField
                    control={form.control}
                    name="Adresse_IP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse IP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ex: 192.168.1.100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ID Serveur */}
                  <FormField
                    control={form.control}
                    name="Id_Serveur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Serveur</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ex: 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Délai réseau */}
                  <FormField
                    control={form.control}
                    name="Delai_Reseau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Délai réseau (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ex: 50"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Délai de réponse réseau en millisecondes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              )}
            </Card>

            {/* Erreur globale */}
            {form.formState.errors.root && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Modification..."
                    : "Création..."
                  : isEditing
                  ? "Modifier"
                  : "Créer"}
              </Button>
            </DialogFooter>

            {/* Matériel associé (affichage en édition) */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t space-y-3">
                <h3 className="font-semibold text-sm">Matériel associé</h3>
                {sondesLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Chargement...
                  </div>
                ) : sondes && sondes.length > 0 ? (
                  <TanStackTable
                    columns={sondesAssocieesColumns}
                    data={sondesAssocieesTableData}
                    showSearch={false}
                    showPagination={false}
                    maxHeight="16rem"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Aucun matériel associé
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
