"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, User as UserIcon, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { usersApi, type User, type CreateUserInput } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePasswordRules } from "@/hooks/usePasswordRules";
import { validatePassword } from "@/lib/password-validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  role: z.enum(["user", "admin"]),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function UsersClient({ users }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: rules, isLoading: rulesLoading } = usePasswordRules();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      nom: "",
      prenom: "",
      email: "",
      role: "user",
    },
  });

  // Validation en temps réel du mot de passe
  const currentPassword = form.watch("password");
  const validation = rules ? validatePassword(currentPassword, rules) : null;

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

  const onSubmit = (data: CreateUserFormValues) => {
    // Vérifier les règles de mot de passe
    if (validation && !validation.isValid) {
      toast.error("Le mot de passe ne respecte pas les règles de sécurité");
      return;
    }

    // Créer l'utilisateur (sans passwordConfirm)
    const { passwordConfirm, ...userData } = data;
    createMutation.mutate(userData);
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestion des utilisateurs</h2>
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
                        <Input placeholder="jdupont" {...field} />
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Login</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="gap-1">
                      {user.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                      {user.role === "admin" ? "Admin" : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
