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
  IdUtilisateur: number;
  Login: string;
  Nom: string;
  Prenom: string;
}

interface Site {
  IdSite: number;
  CodeSite?: string;
  LibelleSite?: string;
  Archive?: boolean;
}

interface Group {
  IdGroupe: number;
  NomGroupe?: string;
  NumeroRegroupement?: string;
  Archive?: boolean;
  idLiaison?: number;
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
    queryKey: ["userSites", user?.IdUtilisateur],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`/api/users/${user.IdUtilisateur}/sites`);
      return res.data;
    },
    enabled: isOpen && !!user,
  });

  // Fetch user's groups
  const { data: userGroups = [] } = useQuery({
    queryKey: ["userGroups", user?.IdUtilisateur],
    queryFn: async () => {
      if (!user) return [];
      const res = await axios.get(`/api/users/${user.IdUtilisateur}/groups`);
      return res.data;
    },
    enabled: isOpen && !!user,
  });

  // Initialize selected items when data loads
  useEffect(() => {
    if (userSites.length > 0) {
      setSelectedSites(userSites.map((s: Site) => s.IdSite));
    }
  }, [userSites]);

  useEffect(() => {
    if (userGroups.length > 0) {
      setSelectedGroups(userGroups.map((g: Group) => g.IdGroupe));
    }
  }, [userGroups]);

  // Mutations
  const addSiteMutation = useMutation({
    mutationFn: async (idSite: number) => {
      await axios.post(`/api/users/${user?.IdUtilisateur}/sites`, { idSite });
    },
    onSuccess: () => {
      toast.success("Site ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    },
  });

  const removeSiteMutation = useMutation({
    mutationFn: async (siteId: number) => {
      await axios.delete(`/api/users/${user?.IdUtilisateur}/sites/${siteId}`);
    },
    onSuccess: () => {
      toast.success("Site supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async (idGroupe: number) => {
      await axios.post(`/api/users/${user?.IdUtilisateur}/groups`, { idGroupe });
    },
    onSuccess: () => {
      toast.success("Groupe ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (idLiaison: number) => {
      await axios.delete(`/api/users/${user?.IdUtilisateur}/groups/${idLiaison}`);
    },
    onSuccess: () => {
      toast.success("Groupe supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la suppression");
    },
  });

  const handleSiteToggle = async (siteId: number) => {
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter((id) => id !== siteId));
      await removeSiteMutation.mutateAsync(siteId);
    } else {
      setSelectedSites([...selectedSites, siteId]);
      await addSiteMutation.mutateAsync(siteId);
    }
  };

  const handleGroupToggle = async (groupId: number) => {
    if (selectedGroups.includes(groupId)) {
      const group = userGroups.find((g: Group) => g.IdGroupe === groupId);
      if (group) {
        setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
        await removeGroupMutation.mutateAsync(group.IdLiaison);
      }
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
      await addGroupMutation.mutateAsync(groupId);
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
                    key={site.IdSite}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      id={`site-${site.IdSite}`}
                      checked={selectedSites.includes(site.IdSite)}
                      onCheckedChange={() => handleSiteToggle(site.IdSite)}
                      disabled={addSiteMutation.isPending || removeSiteMutation.isPending}
                    />
                    <Label
                      htmlFor={`site-${site.IdSite}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <span>{site.LibelleSite}</span>
                      {site.Archive && (
                        <Badge variant="secondary" className="text-xs">
                          Archivé
                        </Badge>
                      )}
                    </Label>
                    {selectedSites.includes(site.IdSite) && (
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
                    key={group.IdGroupe}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent"
                  >
                    <Checkbox
                      id={`group-${group.IdGroupe}`}
                      checked={selectedGroups.includes(group.IdGroupe)}
                      onCheckedChange={() => handleGroupToggle(group.IdGroupe)}
                      disabled={addGroupMutation.isPending || removeGroupMutation.isPending}
                    />
                    <Label
                      htmlFor={`group-${group.IdGroupe}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <span>{group.NomGroupe}</span>
                      {group.Archive && (
                        <Badge variant="secondary" className="text-xs">
                          Archivé
                        </Badge>
                      )}
                    </Label>
                    {selectedGroups.includes(group.IdGroupe) && (
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
