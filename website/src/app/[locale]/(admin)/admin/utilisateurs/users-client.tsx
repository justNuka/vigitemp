"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { usersApi, type CreateUserInput, type User } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { usePasswordRules } from "@/hooks/usePasswordRules";
import { useProfiles } from "@/hooks/useProfiles";
import { useSitesSimple } from "@/hooks/useSites";
import { useGroups } from "@/hooks/useGroups";

import { CreateUserDialog } from "./_components/create-user-dialog";
import { EditUserDialog } from "./_components/edit-user-dialog";
import { UsersTable } from "./_components/users-table";
import type { CreateUserFormValues, EditUserFormValues } from "./_components/user-schemas";
import {
  addUserGroups,
  addUserSites,
  syncUserGroups,
  syncUserSites,
} from "./_components/user-assignments";
import { confirmArchiveUser, getCreateUserPayload, getUpdateUserPayload } from "./user-payloads";

interface Props {
  users: User[];
}

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

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success("Utilisateur créé avec succès");
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success("Utilisateur modifié avec succès");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
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
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });

  const handleCreateSubmit = (data: CreateUserFormValues) => {
    const payload = getCreateUserPayload(data);

    createMutation.mutate(payload.userData as CreateUserInput, {
      onSuccess: async (createdUser) => {
        try {
          if (payload.siteIds.length) await addUserSites(createdUser.id, payload.siteIds);
          if (payload.groupIds.length) await addUserGroups(createdUser.id, payload.groupIds);
        } catch (error) {
          console.error("Erreur lors de l'assignation sites/groupes:", error);
        }
      },
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: EditUserFormValues) => {
    if (!selectedUser) return;

    const payload = getUpdateUserPayload(data);

    updateMutation.mutate(
      { id: selectedUser.id, data: payload.updateData as any },
      {
        onSuccess: async () => {
          try {
            if (payload.siteIds) await syncUserSites(selectedUser.id, payload.siteIds);
            if (payload.groupIds) await syncUserGroups(selectedUser.id, payload.groupIds);
          } catch (error) {
            console.error(
              "Erreur lors de la mise à jour des sites/groupes:",
              error
            );
          }
        },
      }
    );
  };

  const handleArchiveUser = (user: User) => {
    if (confirmArchiveUser(user)) {
      archiveMutation.mutate(user.id);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 animate-fade-in">
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        rules={rules}
        rulesLoading={rulesLoading}
        profiles={profiles as any}
        profilesLoading={profilesLoading}
        sites={sites as any}
        sitesLoading={sitesLoading}
        groups={groups as any}
        groupsLoading={groupsLoading}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        profiles={profiles as any}
        profilesLoading={profilesLoading}
        isSubmitting={updateMutation.isPending}
        isArchiving={archiveMutation.isPending}
        onSubmit={handleEditSubmit}
        onArchive={handleArchiveUser}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} utilisateur{users.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <UsersTable
            users={users}
            selectedUserId={selectedUser?.id ?? null}
            onEditUser={handleEditUser}
            onSelectUser={setSelectedUser}
          />
        </CardContent>
      </Card>
    </main>
  );
}
