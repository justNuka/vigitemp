"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { User } from "@/lib/api";

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
import type { ProfileOption } from "./user-option-types";
import { getEditUserDefaults } from "./user-mappers";
import { UserDangerZone } from "./user-danger-zone";
import { UserEmailField, UserExpiryFields, UserNameFields, UserProfileField } from "./user-form-sections";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  profiles?: ProfileOption[];
  profilesLoading: boolean;
  isSubmitting: boolean;
  isArchiving: boolean;
  onSubmit: (data: EditUserFormValues) => void;
  onArchive: (user: User) => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  profiles,
  profilesLoading,
  isSubmitting,
  isArchiving,
  onSubmit,
  onArchive,
}: Props) {
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

  useEffect(() => {
    if (!open || !user) return;
    editForm.reset(getEditUserDefaults(user));
  }, [editForm, open, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifier les informations de {user?.username}
          </DialogDescription>
        </DialogHeader>

        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
            <UserNameFields control={editForm.control} order="last-first" />
            <UserEmailField control={editForm.control} />

            <UserProfileField control={editForm.control} profiles={profiles} isLoading={profilesLoading} />

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
