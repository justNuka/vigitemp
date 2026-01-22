"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import type { User } from "@/lib/api";
import { getJson } from "@/lib/http";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { editUserSchema, type EditUserFormValues } from "./user-schemas";
import type { GroupOption, ProfileOption, SiteOption } from "./user-option-types";
import { getEditUserDefaults } from "./user-mappers";
import { UserDangerZone } from "./user-danger-zone";
import {
  UserEmailField,
  UserExpiryFields,
  UserGroupsField,
  UserNameFields,
  UserProfileField,
  UserSitesField,
} from "./user-form-sections";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  profiles?: ProfileOption[];
  profilesLoading: boolean;
  sites?: SiteOption[];
  sitesLoading: boolean;
  groups?: GroupOption[];
  groupsLoading: boolean;
  isSubmitting: boolean;
  isArchiving: boolean;
  isReactivating: boolean;
  onSubmit: (data: EditUserFormValues) => void;
  onArchive: (user: User) => void;
  onReactivate: (user: User) => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  profiles,
  profilesLoading,
  sites,
  sitesLoading,
  groups,
  groupsLoading,
  isSubmitting,
  isArchiving,
  isReactivating,
  onSubmit,
  onArchive,
  onReactivate,
}: Props) {
  const userId = user?.id;
  const isArchived = Boolean(user && !user.isActive);
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
  const didInitRef = useRef(false);

  const { data: assignedSites, isLoading: assignedSitesLoading } = useQuery({
    queryKey: ["user-sites", userId],
    queryFn: () => getJson<any[]>(`/api/utilisateurs/${userId}/sites`),
    enabled: Boolean(open && userId),
  });

  const { data: assignedGroups, isLoading: assignedGroupsLoading } = useQuery({
    queryKey: ["user-groups", userId],
    queryFn: () => getJson<any[]>(`/api/utilisateurs/${userId}/groupes`),
    enabled: Boolean(open && userId),
  });

  const assignedSiteIds = useMemo(
    () =>
      (assignedSites ?? [])
        .map((site: any) => site?.Id_Site)
        .filter((id: any) => typeof id === "number") as number[],
    [assignedSites],
  );

  const assignedGroupIds = useMemo(
    () =>
      (assignedGroups ?? [])
        .map((group: any) => group?.Id_Groupe)
        .filter((id: any) => typeof id === "number") as number[],
    [assignedGroups],
  );

  useEffect(() => {
    if (!open || !user) return;
    didInitRef.current = false;
  }, [open, user]);

  useEffect(() => {
    if (!open || !user) return;
    if (didInitRef.current) return;
    if (assignedSitesLoading || assignedGroupsLoading) return;

    editForm.reset({
      ...getEditUserDefaults(user),
      siteIds: assignedSiteIds,
      groupeIds: assignedGroupIds,
    });
    didInitRef.current = true;
  }, [
    assignedGroupIds,
    assignedGroupsLoading,
    assignedSiteIds,
    assignedSitesLoading,
    editForm,
    open,
    user,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifier les informations de {user?.username}
          </DialogDescription>
        </DialogHeader>

        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
            {isArchived ? (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Ce compte est archivé et ne peut pas se connecter.
              </div>
            ) : null}

            <UserNameFields control={editForm.control} order="last-first" />
            <UserEmailField control={editForm.control} />

            <UserProfileField control={editForm.control} profiles={profiles} isLoading={profilesLoading} />

            <div className="grid gap-4 md:grid-cols-2">
              <UserSitesField control={editForm.control} sites={sites} isLoading={sitesLoading} />
              <UserGroupsField control={editForm.control} groups={groups} isLoading={groupsLoading} />
            </div>

            <UserExpiryFields control={editForm.control} enabled={hasEditExpiryDate} />

            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">
                Changer le mot de passe (optionnel)
              </p>
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Laisser vide pour ne pas modifier"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isArchived && user ? (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-medium">Réactiver le compte</p>
                <p className="mt-1 text-xs text-emerald-100/80">
                  Le compte sera réactivé et pourra se reconnecter.
                </p>
                <Button
                  type="button"
                  className="mt-3"
                  variant="secondary"
                  disabled={isReactivating}
                  onClick={() => onReactivate(user)}
                >
                  {isReactivating ? "Réactivation..." : "Réactiver"}
                </Button>
              </div>
            ) : null}

            <UserDangerZone user={user} isArchiving={isArchiving} onArchive={onArchive} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
