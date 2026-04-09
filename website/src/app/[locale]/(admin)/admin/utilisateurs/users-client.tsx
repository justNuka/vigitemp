"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users } from "lucide-react";
import { usersApi, type CreateUserInput, type User } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { getJson } from "@/lib/http";
import { useTranslations } from "next-intl";

import { LazyMotion, domAnimation, m } from "motion/react";
import { fadeInUp } from "@/lib/motion-variants";

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
  const didPrefetchRef = useRef(false);
  const t = useTranslations("usersPage");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");

  const activeUsers = users.filter((user) => user.isActive);
  const archivedUsers = users.filter((user) => !user.isActive);
  const displayedUsers = statusTab === "active" ? activeUsers : archivedUsers;

  const shouldLoadFormData = isCreateDialogOpen || isEditDialogOpen;
  const { data: rules, isLoading: rulesLoading } = usePasswordRules(shouldLoadFormData);
  const { data: profiles, isLoading: profilesLoading } = useProfiles(shouldLoadFormData);
  const { data: sites, isLoading: sitesLoading } = useSitesSimple(shouldLoadFormData);
  const { data: groups, isLoading: groupsLoading } = useGroups(undefined, shouldLoadFormData);

  useEffect(() => {
    if (didPrefetchRef.current) return;
    didPrefetchRef.current = true;

    queryClient.prefetchQuery({
      queryKey: ["password-rules"],
      queryFn: () => getJson("/api/parametres/password-rules"),
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: ["profiles"],
      queryFn: () => getJson("/api/profils"),
    });
    queryClient.prefetchQuery({
      queryKey: ["sites-simple"],
      queryFn: () => getJson("/api/sites"),
    });
    queryClient.prefetchQuery({
      queryKey: ["groups", undefined],
      queryFn: () => getJson("/api/groupes"),
    });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      toast.success(t("toast.create_success"));
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error(t("toast.create_error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      toast.success(t("toast.update_success"));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error(t("toast.update_error"));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success(t("toast.archive_success"));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error(t("toast.archive_error"));
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
      toast.success(t("toast.reactivate_success"));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error(t("toast.reactivate_error"));
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
        } finally {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          router.refresh();
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
          } finally {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            router.refresh();
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

  const handleReactivateUser = (user: User) => {
    reactivateMutation.mutate(user.id);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.main
        className="flex-1 p-4 md:p-6 space-y-6"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
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
        sites={sites as any}
        sitesLoading={sitesLoading}
        groups={groups as any}
        groupsLoading={groupsLoading}
        isSubmitting={updateMutation.isPending}
        isArchiving={archiveMutation.isPending}
        isReactivating={reactivateMutation.isPending}
        onSubmit={handleEditSubmit}
        onArchive={handleArchiveUser}
        onReactivate={handleReactivateUser}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 bg-white/90 dark:bg-card/90">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              {t("title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("count", { count: displayedUsers.length })}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {t("actions.new")}
          </Button>
        </CardHeader>
        <CardContent className="p-2 md:p-4 xl:p-4">
          <Tabs
            value={statusTab}
            onValueChange={(value) => {
              setStatusTab(value as "active" | "archived");
              setSelectedUser(null);
            }}
            className="space-y-4"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 text-primary">
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("tabs.active", { count: activeUsers.length })}
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("tabs.archived", { count: archivedUsers.length })}
              </TabsTrigger>
            </TabsList>
            <UsersTable
              users={displayedUsers}
              selectedUserId={selectedUser?.id ?? null}
              onEditUser={handleEditUser}
              onSelectUser={setSelectedUser}
              onDoubleClickUser={handleEditUser}
            />
          </Tabs>
        </CardContent>
      </Card>
      </m.main>
    </LazyMotion>
  );
}

