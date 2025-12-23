"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TanStackTable } from "@/components/data-table/tanstack-table";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserPlus, Shield, User as UserIcon, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle, Calendar as CalendarIcon, Pencil, AlertTriangle } from "lucide-react";
import { usersApi, type User, type CreateUserInput } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { useProfiles } from "@/hooks/useProfiles";
import { useSitesSimple } from "@/hooks/useSites";
import { useGroups } from "@/hooks/useGroups";
import { validatePassword } from "@/lib/password-validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  users: User[];
}

// Schéma de validation Zod
const createUserSchema = z.object({
  username: z.string().min(3, "Le login doit contenir au moins 3 caractères"),
  password: z.string().min(1, "Le mot de passe est requis"),
  passwordConfirm: z.string().min(1, "La confirmation est requise"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  profileId: z.string().min(1, "Le profil est requis"),
  telephone: z.string().optional(),
  siteIds: z.array(z.number()).optional(),
  groupeIds: z.array(z.number()).optional(),
  hasExpiryDate: z.boolean(),
  expiryDate: z.date().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
}).refine((data) => !data.hasExpiryDate || data.expiryDate, {
  message: "La date de validité est requise quand activée",
  path: ["expiryDate"],
});

const editUserSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  profileId: z.string().min(1, "Le profil est requis"),
  telephone: z.string().optional(),
  siteIds: z.array(z.number()).optional(),
  groupeIds: z.array(z.number()).optional(),
  hasExpiryDate: z.boolean(),
  expiryDate: z.date().optional(),
  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
}).refine((data) => !data.password || data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
}).refine((data) => !data.hasExpiryDate || data.expiryDate, {
  message: "La date de validité est requise quand activée",
  path: ["expiryDate"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

export function UsersClient({ users }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: sites, isLoading: sitesLoading } = useSitesSimple();
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Colonnes TanStack
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Login",
      cell: ({ row }) => <span className="font-medium">{row.getValue("username")}</span>,
    },
    {
      accessorKey: "displayName",
      header: "Nom complet",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email") || "-"}</span>,
    },
    {
      accessorKey: "role",
      header: "Profil",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      accessorKey: "expiry_date",
      header: "Date d'expiration",
      cell: ({ row }) => {
        const date = row.getValue("expiry_date");
        return date ? format(new Date(date as string), "dd/MM/yyyy", { locale: fr }) : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditUser(row.original)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
      ),
    },
  ];

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      nom: "",
      prenom: "",
      email: "",
      profileId: "",
      telephone: "",
      siteIds: [],
      groupeIds: [],
      hasExpiryDate: false,
      expiryDate: undefined,
    } as CreateUserFormValues,
  });

  const hasExpiryDate = form.watch("hasExpiryDate");

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      profileId: "",
      hasExpiryDate: false,
      expiryDate: undefined,
      password: "",
      passwordConfirm: "",
    } as EditUserFormValues,
  });

  const hasEditExpiryDate = editForm.watch("hasExpiryDate");

  // Validation en temps réel du mot de passe
  const currentPassword = form.watch("password");
  const validation = rules ? validatePassword(currentPassword, rules as any) : null;

  const generatePassword = () => {
    if (!rules) return;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{};\':"|,.<>/?';
    
    let password = '';
    
    // Générer en respectant les règles minimales
    for (let i = 0; i < rules.min_uppercase; i++) {
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    for (let i = 0; i < rules.min_lowercase; i++) {
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    for (let i = 0; i < rules.min_numbers; i++) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    for (let i = 0; i < rules.min_special; i++) {
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Compléter pour atteindre la longueur minimale
    const all = uppercase + lowercase + numbers + symbols;
    const remaining = Math.max(rules.min_length - password.length, 4);
    for (let i = 0; i < remaining; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Mélanger les caractères
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    form.setValue("password", shuffled);
    form.setValue("passwordConfirm", shuffled);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shuffled);
    toast.success("Mot de passe généré et copié dans le presse-papiers");
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success("Utilisateur créé avec succès");
      setIsCreateDialogOpen(false);
      form.reset();
      setShowPassword(false);
      setShowPasswordConfirm(false);
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success("Utilisateur modifié avec succès");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success("Compte archivé avec succès");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });

  const handleArchiveUser = () => {
    if (!selectedUser) return;
    
    if (confirm(`Êtes-vous sûr de vouloir archiver le compte de ${selectedUser.username} ? Le compte sera désactivé et l'utilisateur ne pourra plus se connecter.`)) {
      archiveMutation.mutate(selectedUser.id);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      profileId: user.role,
      hasExpiryDate: false,
      expiryDate: undefined,
      password: "",
      passwordConfirm: "",
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    // Vérifier les règles de mot de passe
    if (validation && !validation.isValid) {
      toast.error("Le mot de passe ne respecte pas les règles de sécurité");
      return;
    }

    // Créer l'utilisateur (sans passwordConfirm, hasExpiryDate, siteIds, groupeIds)
    const { passwordConfirm, hasExpiryDate, siteIds, groupeIds, ...userData } = data;
    
    // Créer l'utilisateur
    createMutation.mutate(userData as CreateUserInput, {
      onSuccess: async (createdUser) => {
        // Ajouter les sites
        if (siteIds && siteIds.length > 0) {
          try {
            for (const siteId of siteIds) {
              await fetch(`/api/users/${createdUser.id}/sites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteId }),
              });
            }
          } catch (error) {
            console.error("Erreur lors de l'ajout des sites:", error);
          }
        }

        // Ajouter les groupes
        if (groupeIds && groupeIds.length > 0) {
          try {
            for (const groupId of groupeIds) {
              await fetch(`/api/users/${createdUser.id}/groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId }),
              });
            }
          } catch (error) {
            console.error("Erreur lors de l'ajout des groupes:", error);
          }
        }
      },
    });
  };

  const onEditSubmit = async (data: EditUserFormValues) => {
    if (!selectedUser) return;

    // Préparer les données (enlever passwordConfirm, hasExpiryDate, siteIds, groupeIds, et password vide)
    const { passwordConfirm, hasExpiryDate, siteIds, groupeIds, password, ...userData } = data;
    const updateData = {
      ...userData,
      ...(password ? { password } : {}),
    };

    updateMutation.mutate({ id: selectedUser.id, data: updateData as any }, {
      onSuccess: async () => {
        // Mettre à jour les sites
        if (siteIds) {
          try {
            // Récupérer les sites actuels
            const response = await fetch(`/api/users/${selectedUser.id}/sites`);
            const currentSites = await response.json();
            const currentSiteIds = currentSites.map((s: any) => s.id_Site);

            // Supprimer les sites qui ne sont plus sélectionnés
            for (const siteId of currentSiteIds) {
              if (!siteIds.includes(siteId)) {
                await fetch(`/api/users/${selectedUser.id}/sites/${siteId}`, {
                  method: "DELETE",
                });
              }
            }

            // Ajouter les nouveaux sites
            for (const siteId of siteIds) {
              if (!currentSiteIds.includes(siteId)) {
                await fetch(`/api/users/${selectedUser.id}/sites`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ siteId }),
                });
              }
            }
          } catch (error) {
            console.error("Erreur lors de la mise à jour des sites:", error);
          }
        }

        // Mettre à jour les groupes (logique similaire)
        if (groupeIds) {
          try {
            const response = await fetch(`/api/users/${selectedUser.id}/groups`);
            const currentGroups = await response.json();
            const currentGroupIds = currentGroups.map((g: any) => g.id);

            for (const groupId of currentGroupIds) {
              if (!groupeIds.includes(groupId)) {
                await fetch(`/api/users/${selectedUser.id}/groups/${groupId}`, {
                  method: "DELETE",
                });
              }
            }

            for (const groupId of groupeIds) {
              if (!currentGroupIds.includes(groupId)) {
                await fetch(`/api/users/${selectedUser.id}/groups`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ groupId }),
                });
              }
            }
          } catch (error) {
            console.error("Erreur lors de la mise à jour des groupes:", error);
          }
        }
      },
    });
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>
                Ajouter un nouvel utilisateur au système
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login *</FormLabel>
                      <FormControl>
                        <Input placeholder="jdupont" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mot de passe *</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generatePassword}
                          className="gap-2 h-8"
                          disabled={rulesLoading}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Générer
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Entrez un mot de passe"
                            autoComplete="new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      
                      {/* Règles de mot de passe */}
                      {rules && currentPassword && (
                  <div className="mt-2 p-3 rounded-lg border bg-muted/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Règles de sécurité :
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {currentPassword.length >= rules.min_length ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={currentPassword.length >= rules.min_length ? "text-green-600" : "text-red-600"}>
                          Au moins {rules.min_length} caractères
                        </span>
                      </div>
                      
                      {rules.min_uppercase > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          {(currentPassword.match(/[A-Z]/g) || []).length >= rules.min_uppercase ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={(currentPassword.match(/[A-Z]/g) || []).length >= rules.min_uppercase ? "text-green-600" : "text-red-600"}>
                            Au moins {rules.min_uppercase} majuscule{rules.min_uppercase > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      
                      {rules.min_lowercase > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          {(currentPassword.match(/[a-z]/g) || []).length >= rules.min_lowercase ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={(currentPassword.match(/[a-z]/g) || []).length >= rules.min_lowercase ? "text-green-600" : "text-red-600"}>
                            Au moins {rules.min_lowercase} minuscule{rules.min_lowercase > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      
                      {rules.min_numbers > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          {(currentPassword.match(/[0-9]/g) || []).length >= rules.min_numbers ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={(currentPassword.match(/[0-9]/g) || []).length >= rules.min_numbers ? "text-green-600" : "text-red-600"}>
                            Au moins {rules.min_numbers} chiffre{rules.min_numbers > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      
                      {rules.min_special > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          {(currentPassword.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= rules.min_special ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className={(currentPassword.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= rules.min_special ? "text-green-600" : "text-red-600"}>
                            Au moins {rules.min_special} caractère{rules.min_special > 1 ? "s" : ""} spécial{rules.min_special > 1 ? "aux" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="Retapez le mot de passe"
                            autoComplete="new-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={profilesLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un profil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.name}>
                              {profile.name}
                              {profile.description && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({profile.description})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le profil détermine les autorisations de l'utilisateur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33612345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sites</FormLabel>
                      <div className="space-y-2">
                        {sites?.map((site) => (
                          <div key={site.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`site-${site.id}`}
                              checked={field.value?.includes(site.id) || false}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...(field.value || []), site.id]
                                  : (field.value || []).filter(id => id !== site.id);
                                field.onChange(newValues);
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`site-${site.id}`} className="text-sm">
                              {site.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupeIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Groupes</FormLabel>
                      <div className="space-y-2">
                        {groups?.map((group) => (
                          <div key={group.Id_Groupe} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`groupe-${group.Id_Groupe}`}
                              checked={field.value?.includes(group.Id_Groupe) || false}
                              onChange={(e) => {
                                const newValues = e.target.checked
                                  ? [...(field.value || []), group.Id_Groupe]
                                  : (field.value || []).filter(id => id !== group.Id_Groupe);
                                field.onChange(newValues);
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`groupe-${group.Id_Groupe}`} className="text-sm">
                              {group.Nom_Groupe}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasExpiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Date de validité
                        </FormLabel>
                        <FormDescription>
                          Définir une date d'expiration pour le compte
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {hasExpiryDate && (
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date d'expiration *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Le compte sera automatiquement désactivé à cette date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition d'utilisateur */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifier les informations de {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="profileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={profilesLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un profil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {profiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.name}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="hasExpiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Date de validité</FormLabel>
                        <FormDescription>Définir une date d'expiration</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {hasEditExpiryDate && (
                  <FormField
                    control={editForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date d'expiration *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">Changer le mot de passe (optionnel)</p>
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Laisser vide pour ne pas modifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirmer le mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Zone de danger */}
                <div className="space-y-3 pt-4 border-t border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">Zone de danger</p>
                  </div>
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Archiver ce compte</p>
                        <p className="text-xs text-muted-foreground">
                          Le compte sera désactivé et l'utilisateur ne pourra plus se connecter. Cette action peut être annulée en réactivant le compte.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleArchiveUser}
                        disabled={archiveMutation.isPending || !selectedUser?.isActive}
                        className="shrink-0"
                      >
                        {archiveMutation.isPending ? "Archivage..." : "Archiver"}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Modification..." : "Modifier"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} utilisateur{users.length > 1 ? "s" : ""}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <TanStackTable
            columns={columns}
            data={users}
            searchField={["displayName", "username"]}
            searchPlaceholder="Rechercher par nom ou login..."
            pageSize={20}
            emptyMessage="Aucun utilisateur trouvé"
            selectedRowId={selectedUser?.id}
            onRowClick={(row) => setSelectedUser(row as User)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
