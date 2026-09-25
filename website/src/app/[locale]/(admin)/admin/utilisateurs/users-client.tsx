"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getCreateUserPayload, getUpdateUserPayload } from "./user-payloads";

interface Props {
  users: User[];
}

export function UsersClient({ users }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const didPrefetchRef = useRef(false);
  const t = useTranslations("usersPage");
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [archiveCandidate, setArchiveCandidate] = useState<User | null>(null);
  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const activeUsers = useMemo(() => localUsers.filter((user) => user.isActive), [localUsers]);
  const archivedUsers = useMemo(() => localUsers.filter((user) => !user.isActive), [localUsers]);
  const displayedUsers = statusTab === "active" ? activeUsers : archivedUsers;

  const shouldLoadFormData = isCreateDialogOpen || isEditDialogOpen;
  const { data: rules, isLoading: rulesLoading } = usePasswordRules(shouldLoadFormData);
  const profileStatus = isEditDialogOpen ? "all" : "active";
  const { data: profiles, isLoading: profilesLoading } = useProfiles(shouldLoadFormData, profileStatus);
  const { data: sites, isLoading: sitesLoading } = useSitesSimple(shouldLoadFormData);
  const { data: groups, isLoading: groupsLoading } = useGroups(undefined, shouldLoadFormData);
  const editProfiles = useMemo(() => {
    if (!profiles) return profiles;
    const currentProfileName = selectedUser?.role?.trim().toLocaleLowerCase() ?? "";
    return profiles.filter(
      (profile) =>
        profile.estArchive !== true ||
        profile.name.trim().toLocaleLowerCase() === currentProfileName,
    );
  }, [profiles, selectedUser?.role]);

  useEffect(() => {
    if (didPrefetchRef.current) return;
    didPrefetchRef.current = true;

    queryClient.prefetchQuery({
      queryKey: ["password-rules"],
      queryFn: () => getJson("/api/parametres/password-rules"),
      staleTime: 5 * 60 * 1000,
    });
    queryClient.prefetchQuery({
      queryKey: ["profiles", "active"],
      queryFn: () => getJson("/api/profils?status=active"),
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
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("toast.create_error"));
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
    onSuccess: (_data, id) => {
      setLocalUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, isActive: false } : user)),
      );
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
    onSuccess: (_data, id) => {
      setLocalUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, isActive: true } : user)),
      );
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
          setLocalUsers((current) => [
            {
              id: createdUser.id,
              username: createdUser.username,
              displayName: createdUser.displayName,
              nom: payload.userData.nom,
              prenom: payload.userData.prenom,
              email: payload.userData.email,
              role: payload.userData.profileId,
              isActive: true,
              createdAt: new Date(),
              avatar: payload.userData.avatar ?? null,
            },
            ...current,
          ]);
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
            setLocalUsers((current) =>
              current.map((user) =>
                user.id === selectedUser.id
                  ? {
                      ...user,
                      username: typeof payload.updateData.username === "string" ? payload.updateData.username : user.username,
                      nom: typeof payload.updateData.nom === "string" ? payload.updateData.nom : user.nom,
                      prenom: typeof payload.updateData.prenom === "string" ? payload.updateData.prenom : user.prenom,
                      email: typeof payload.updateData.email === "string" ? payload.updateData.email : user.email,
                      role: typeof payload.updateData.profileId === "string" ? payload.updateData.profileId : user.role,
                      avatar:
                        Object.prototype.hasOwnProperty.call(payload.updateData, "avatar")
                          ? ((payload.updateData.avatar as string | null | undefined) ?? null)
                          : user.avatar,
                      displayName: `${typeof payload.updateData.prenom === "string" ? payload.updateData.prenom : user.prenom} ${typeof payload.updateData.nom === "string" ? payload.updateData.nom : user.nom}`.trim() || user.username,
                    }
                  : user,
              ),
            );
            queryClient.invalidateQueries({ queryKey: ["user-sites", selectedUser.id] });
            queryClient.invalidateQueries({ queryKey: ["user-groups", selectedUser.id] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            router.refresh();
          }
        },
      }
    );
  };

  const handleArchiveUser = (user: User) => {
    setArchiveCandidate(user);
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
        profiles={editProfiles as any}
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

      <AlertDialog open={!!archiveCandidate} onOpenChange={(open) => { if (!open) setArchiveCandidate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogs.archive.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.archive.description", { username: archiveCandidate?.username ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialogs.archive.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!archiveCandidate) return;
                archiveMutation.mutate(archiveCandidate.id);
                setArchiveCandidate(null);
              }}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? t("dialogs.archive.submitting") : t("dialogs.archive.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

