"use client";
import { showFormValidationToast } from "@/lib/form-toast"

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, RefreshCw, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import type { PasswordRules } from "@/lib/api";
import { validatePassword } from "@/lib/password-validation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemporaryMemoryControls } from "@/components/form/temporary-memory-controls";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { createUserSchema, type CreateUserFormValues } from "./user-schemas";
import { UserAvatarField } from "./user-avatar-field";
import { generatePasswordFromRules } from "./password-utils";
import type { GroupOption, ProfileOption, SiteOption } from "./user-option-types";
import {
  UserEmailField,
  UserExpiryFields,
  UserGroupsField,
  UserNameFields,
  UserPhoneField,
  UserProfileField,
  UserSitesField,
  UserUsernameField,
} from "./user-form-sections";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules?: PasswordRules;
  rulesLoading: boolean;
  profiles?: ProfileOption[];
  profilesLoading: boolean;
  sites?: SiteOption[];
  sitesLoading: boolean;
  groups?: GroupOption[];
  groupsLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (data: CreateUserFormValues) => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  rules,
  rulesLoading,
  profiles,
  profilesLoading,
  sites,
  sitesLoading,
  groups,
  groupsLoading,
  isSubmitting,
  onSubmit,
}: Props) {
  const t = useTranslations("createUserDialog");
  const tForm = useTranslations("userForm");
  const tCommon = useTranslations("common");
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
      profileId: "",
      telephone: "",
      siteIds: [],
      groupeIds: [],
      hasExpiryDate: false,
      expiryDate: undefined,
      avatar: "",
    } as CreateUserFormValues,
  });

  const hasExpiryDate = form.watch("hasExpiryDate");
  const currentPassword = form.watch("password");
  const memoryKey = "create-user-form:new";

  const validation = useMemo(
    () => (rules ? validatePassword(currentPassword, rules as any) : null),
    [currentPassword, rules]
  );

  useEffect(() => {
    if (!open) {
      form.reset();
      setShowPassword(false);
      setShowPasswordConfirm(false);
    }
  }, [form, open]);

  const generatePassword = () => {
    if (!rules) return;

    const generated = generatePasswordFromRules(rules);
    form.setValue("password", generated);
    form.setValue("passwordConfirm", generated);

    navigator.clipboard.writeText(generated);
    toast.success(t("toast.password_generated"));
  };

  const handleSubmit = (data: CreateUserFormValues) => {
    if (validation && !validation.isValid) {
      toast.error(t("toast.password_invalid"));
      return;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={{
                username: "",
                password: "",
                passwordConfirm: "",
                nom: "",
                prenom: "",
                email: "",
                profileId: "",
                telephone: "",
                siteIds: [],
                groupeIds: [],
                hasExpiryDate: false,
                expiryDate: undefined,
                avatar: "",
              } as CreateUserFormValues}
              labels={{
                save: tCommon('temporary_memory.save'),
                restore: tCommon('temporary_memory.restore'),
                clear: tCommon('temporary_memory.clear'),
                saved: tCommon('temporary_memory.saved'),
              }}
            />
            <UserNameFields control={form.control} />
            <UserEmailField control={form.control} />
            <UserUsernameField control={form.control} />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("password.label")}</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="gap-2 h-8"
                      disabled={rulesLoading}
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t("password.generate")}
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("password.placeholder")}
                        autoComplete="new-password"
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

                  {rules && currentPassword && (
                    <div className="mt-2 p-3 rounded-lg border bg-muted/50 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("rules.title")}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {currentPassword.length >= rules.min_length ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={
                              currentPassword.length >= rules.min_length
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {t("rules.min_length", { count: rules.min_length })}
                          </span>
                        </div>

                        {rules.min_uppercase > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            {(currentPassword.match(/[A-Z]/g) || []).length >=
                            rules.min_uppercase ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={
                                (currentPassword.match(/[A-Z]/g) || []).length >=
                                rules.min_uppercase
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {t("rules.min_uppercase", { count: rules.min_uppercase })}
                            </span>
                          </div>
                        )}

                        {rules.min_lowercase > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            {(currentPassword.match(/[a-z]/g) || []).length >=
                            rules.min_lowercase ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={
                                (currentPassword.match(/[a-z]/g) || []).length >=
                                rules.min_lowercase
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {t("rules.min_lowercase", { count: rules.min_lowercase })}
                            </span>
                          </div>
                        )}

                        {rules.min_numbers > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            {(currentPassword.match(/[0-9]/g) || []).length >=
                            rules.min_numbers ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={
                                (currentPassword.match(/[0-9]/g) || []).length >=
                                rules.min_numbers
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {t("rules.min_numbers", { count: rules.min_numbers })}
                            </span>
                          </div>
                        )}

                        {rules.min_special > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            {(currentPassword.match(
                              /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g
                            ) || []).length >= rules.min_special ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={
                                (currentPassword.match(
                                  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g
                                ) || []).length >= rules.min_special
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {t("rules.min_special", { count: rules.min_special })}
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
                  <FormLabel>{t("password.confirm_label")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder={t("password.confirm_placeholder")}
                        autoComplete="new-password"
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

            <UserProfileField
              control={form.control}
              profiles={profiles}
              isLoading={profilesLoading}
              description={t("profile.description")}
            />

            <UserPhoneField control={form.control} />
            <UserAvatarField control={form.control} />

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
              <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                {tForm("infos.default_visibility")}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <UserSitesField control={form.control} sites={sites} isLoading={sitesLoading} />
                <UserGroupsField control={form.control} groups={groups} isLoading={groupsLoading} />
              </div>
            </div>

            <UserExpiryFields control={form.control} enabled={hasExpiryDate} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("actions.submit_loading") : t("actions.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
