import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface User {
  Id_Utilisateur: number;
  Login: string;
  Nom: string;
  Prenom: string;
}

interface Site {
  Id_Site: number;
  Code_Site?: string;
  Libelle_Site?: string;
  Est_Archive?: boolean;
}

interface Group {
  Id_Groupe: number;
  Nom_Groupe?: string;
  Numero_Regroupement?: string;
  Est_Archive?: boolean;
  Id_Liaison?: number;
}

interface UserAccessDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function UserAccessDialog({
  user,
  isOpen,
  onOpenChange,
  onSaved,
}: UserAccessDialogProps) {
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Fetch all sites
  const { data: allSites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const res = await axios.get("/api/sites");
      return res.data;
    },
    enabled: isOpen,
  });

  // Fetch all groups
  const { data: allGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await axios.get("/api/groups");
      return res.data;
    },
    enabled: isOpen,
  });

  // Fetch user's sites
  const { data: userSites = [] } = useQuery({
    queryKey: ["userSites", user?.Id_Utilisateur],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`/api/users/${user.Id_Utilisateur}/sites`);
      return res.data;
    },
    enabled: isOpen && !!user,
  });

  // Fetch user's groups
  const { data: userGroups = [] } = useQuery({
    queryKey: ["userGroups", user?.Id_Utilisateur],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`/api/users/${user.Id_Utilisateur}/groups`);
      return res.data;
    },
    enabled: isOpen && !!user,
  });

  // Initialize selected items when data loads
  useEffect(() => {
    if (userSites.length > 0) {
      setSelectedSites(userSites.map((s: Site) => s.Id_Site));
    }
  }, [userSites]);

  useEffect(() => {
    if (userGroups.length > 0) {
      setSelectedGroups(userGroups.map((g: Group) => g.Id_Groupe));
    }
  }, [userGroups]);

  // Mutations
  const addSiteMutation = useMutation({
    mutationFn: async (Id_Site: number) => {
      await axios.post(`/api/users/${user?.Id_Utilisateur}/sites`, { Id_Site });
    },
    onSuccess: () => {
      toast.success("Site ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    },
  });

  const removeSiteMutation = useMutation({
    mutationFn: async (Id_Site: number) => {
      await axios.delete(`/api/users/${user?.Id_Utilisateur}/sites/${Id_Site}`);
    },
    onSuccess: () => {
      toast.success("Site supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async (Id_Groupe: number) => {
      await axios.post(`/api/users/${user?.Id_Utilisateur}/groups`, { Id_Groupe });
    },
    onSuccess: () => {
      toast.success("Groupe ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (Id_Liaison: number) => {
      await axios.delete(`/api/users/${user?.Id_Utilisateur}/groups/${Id_Liaison}`);
    },
    onSuccess: () => {
      toast.success("Groupe supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    },
  });

  const handleSiteToggle = async (Id_Site: number) => {
    if (selectedSites.includes(Id_Site)) {
      setSelectedSites(selectedSites.filter((id) => id !== Id_Site));
      await removeSiteMutation.mutateAsync(Id_Site);
    } else {
      setSelectedSites([...selectedSites, Id_Site]);
      await addSiteMutation.mutateAsync(Id_Site);
    }
  };

  const handleGroupToggle = async (Id_Groupe: number) => {
    if (selectedGroups.includes(Id_Groupe)) {
      const group = userGroups.find((g: Group) => g.Id_Groupe === Id_Groupe);
      if (group) {
        setSelectedGroups(selectedGroups.filter((id) => id !== Id_Groupe));
        await removeGroupMutation.mutateAsync(group.Id_Liaison);
      }
    } else {
      setSelectedGroups([...selectedGroups, Id_Groupe]);
      await addGroupMutation.mutateAsync(Id_Groupe);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Accès aux ressources</DialogTitle>
          <DialogDescription>
            Gérer les sites et groupes pour {user.Prenom} {user.Nom}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="sites" className="w-full">
          <TabsList>
            <TabsTrigger value="sites">Sites ({selectedSites.length})</TabsTrigger>
            <TabsTrigger value="groups">Groupes ({selectedGroups.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sites" className="space-y-4">
            {sitesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : allSites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun site disponible
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allSites.map((site: Site) => (
                  <div
                    key={site.Id_Site}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      id={`site-${site.Id_Site}`}
                      checked={selectedSites.includes(site.Id_Site)}
                      onCheckedChange={() => handleSiteToggle(site.Id_Site)}
                      disabled={addSiteMutation.isPending || removeSiteMutation.isPending}
                    />
                    <Label
                      htmlFor={`site-${site.Id_Site}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <span>{site.Libelle_Site}</span>
                      {site.Est_Archive && (
                        <Badge variant="secondary" className="text-xs">
                          Archivé
                        </Badge>
                      )}
                    </Label>
                    {selectedSites.includes(site.Id_Site) && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {groupsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : allGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun groupe disponible
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allGroups.map((group: Group) => (
                  <div
                    key={group.Id_Groupe}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      id={`group-${group.Id_Groupe}`}
                      checked={selectedGroups.includes(group.Id_Groupe)}
                      onCheckedChange={() => handleGroupToggle(group.Id_Groupe)}
                      disabled={addGroupMutation.isPending || removeGroupMutation.isPending}
                    />
                    <Label
                      htmlFor={`group-${group.Id_Groupe}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <span>{group.Nom_Groupe}</span>
                      {group.Est_Archive && (
                        <Badge variant="secondary" className="text-xs">
                          Archivé
                        </Badge>
                      )}
                    </Label>
                    {selectedGroups.includes(group.Id_Groupe) && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
