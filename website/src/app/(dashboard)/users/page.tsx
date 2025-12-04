"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, User as UserIcon } from "lucide-react";
import { usersApi, alarmsApi } from "@/lib/api";
import { toast } from "sonner";
import type { User, CreateUserInput } from "@/lib/api";

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserInput>({
    username: "",
    password: "",
    displayName: "",
    role: "user",
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll(),
  });

  const { data: alarms } = useQuery({
    queryKey: ["alarms", "active"],
    queryFn: () => alarmsApi.getActive(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé avec succès");
      setIsCreateDialogOpen(false);
      setNewUser({ username: "", password: "", displayName: "", role: "user" });
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  const handleCreate = () => {
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    createMutation.mutate(newUser);
  };

  const activeAlarms = alarms?.filter((a) => a.status === "active") || [];

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Administration des comptes utilisateurs"
        activeAlarms={activeAlarms.length}
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur au système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom complet</Label>
                <Input
                  id="displayName"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "admin" | "user") =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Aucun utilisateur
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role === "admin" ? "Administrateur" : "Utilisateur"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
