"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Shield, Users, Trash2, Edit, CheckCircle2 } from "lucide-react";
import { useProfiles, useAuthorizations, type Profile, type Authorization } from "@/hooks/useProfiles";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProfilesClient() {
  const queryClient = useQueryClient();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: authorizations, isLoading: authorizationsLoading } = useAuthorizations();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mc2: false,
    authorizations: [] as number[],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/profils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profil créé avec succès");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/profils/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profil mis à jour avec succès");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedProfile(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/profils/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profil supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelectedProfile(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      mc2: false,
      authorizations: [],
    });
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description || "",
      mc2: profile.mc2 || false,
      authorizations: profile.authorizations.map((a) => a.id),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsDeleteDialogOpen(true);
  };

  const toggleAuthorization = (authId: number) => {
    setFormData((prev) => ({
      ...prev,
      authorizations: prev.authorizations.includes(authId)
        ? prev.authorizations.filter((id) => id !== authId)
        : [...prev.authorizations, authId],
    }));
  };

  const groupAuthorizationsByModule = (auths: Authorization[]) => {
    const groups: { [key: string]: Authorization[] } = {
      "Administration": [],
      "Métrologie": [],
      "Surveillance": [],
      "VigiLog": [],
      "Autres": [],
    };

    auths.forEach((auth) => {
      if (auth.fenAdmin) groups["Administration"].push(auth);
      else if (auth.fenMetrologie) groups["Métrologie"].push(auth);
      else if (auth.fenSurveillance) groups["Surveillance"].push(auth);
      else if (auth.fenVigiLog) groups["VigiLog"].push(auth);
      else groups["Autres"].push(auth);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!selectedProfile) return;
    updateMutation.mutate({ id: selectedProfile.id, data: formData });
  };

  const handleDelete = () => {
    if (!selectedProfile) return;
    deleteMutation.mutate(selectedProfile.id);
  };

  if (profilesLoading || authorizationsLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestion des profils</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {profiles?.length || 0} profil{(profiles?.length || 0) > 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Nouveau profil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un profil</DialogTitle>
              <DialogDescription>
                Définir un nouveau profil d'utilisateur avec ses autorisations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du profil *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Responsable qualité"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle du profil"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mc2"
                  checked={formData.mc2}
                  onCheckedChange={(checked) => setFormData({ ...formData, mc2: checked as boolean })}
                />
                <label htmlFor="mc2" className="text-sm font-medium">
                  Réservé MC2
                </label>
              </div>
              <div>
                <Label className="mb-3 block">Autorisations</Label>
                <div className="space-y-4">
                  {authorizations && groupAuthorizationsByModule(authorizations).map(([module, auths]) => (
                    <Card key={module}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">{module}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {auths.map((auth) => (
                          <div key={auth.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`auth-${auth.id}`}
                              checked={formData.authorizations.includes(auth.id)}
                              onCheckedChange={() => toggleAuthorization(auth.id)}
                            />
                            <div className="flex-1">
                              <label htmlFor={`auth-${auth.id}`} className="text-sm font-medium cursor-pointer">
                                {auth.label || auth.code}
                              </label>
                              {auth.description && (
                                <p className="text-xs text-muted-foreground">{auth.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profils</CardTitle>
          <CardDescription>
            Les profils définissent les autorisations des utilisateurs sur l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Autorisations</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {profile.name}
                      {profile.mc2 && (
                        <Badge variant="secondary" className="text-xs">
                          MC2
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {profile.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {profile.authorizations.length} autorisation{profile.authorizations.length > 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {profile.userCount} utilisateur{profile.userCount > 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(profile)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(profile)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifier les informations et autorisations du profil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du profil *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-mc2"
                checked={formData.mc2}
                onCheckedChange={(checked) => setFormData({ ...formData, mc2: checked as boolean })}
              />
              <label htmlFor="edit-mc2" className="text-sm font-medium">
                Réservé MC2
              </label>
            </div>
            <div>
              <Label className="mb-3 block">Autorisations</Label>
              <div className="space-y-4">
                {authorizations && groupAuthorizationsByModule(authorizations).map(([module, auths]) => (
                  <Card key={module}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{module}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {auths.map((auth) => (
                        <div key={auth.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`edit-auth-${auth.id}`}
                            checked={formData.authorizations.includes(auth.id)}
                            onCheckedChange={() => toggleAuthorization(auth.id)}
                          />
                          <div className="flex-1">
                            <label htmlFor={`edit-auth-${auth.id}`} className="text-sm font-medium cursor-pointer">
                              {auth.label || auth.code}
                            </label>
                            {auth.description && (
                              <p className="text-xs text-muted-foreground">{auth.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={!formData.name || updateMutation.isPending}>
              {updateMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le profil</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le profil "{selectedProfile?.name}" ?
              {selectedProfile && selectedProfile.userCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Attention : {selectedProfile.userCount} utilisateur{selectedProfile.userCount > 1 ? "s" : ""} utilise{selectedProfile.userCount > 1 ? "nt" : ""} ce profil.
                  La suppression est impossible.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!selectedProfile || selectedProfile.userCount > 0 || deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
