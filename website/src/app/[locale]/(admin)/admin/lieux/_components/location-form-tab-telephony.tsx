"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import type { LocationFormData } from "./location-form-types";
import type { MailingUser } from "@/hooks/useUsersForMailing";

type Props = {
  users: MailingUser[];
};

export function LocationFormTabTelephony({ users }: Props) {
  const t = useTranslations("locationsForm.telephony");
  const { control, getValues, setValue, watch } = useFormContext<LocationFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "MailingContacts",
  });

  const contacts = watch("MailingContacts") ?? [];
  const groupIds = watch("GroupIds") ?? [];
  const applyMailingToGroups = watch("Apply_Mailing_To_Groups") ?? false;

  const markMailingDirty = () => {
    const current = getValues("MailingContacts") ?? [];
    setValue("MailingContacts", current, { shouldDirty: true, shouldTouch: true });
  };

  const usersById = useMemo(() => {
    const map = new Map<number, MailingUser>();
    for (const user of users) map.set(user.id, user);
    return map;
  }, [users]);

  return (
    <TabsContent value="telephonie" className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{t("title")}</h3>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              append({
                Numero_Ordre: fields.length + 1,
                Id_Utilisateur: null,
                Est_Via_Email: true,
                Est_Via_Telephone: false,
              });
              markMailingDirty();
            }}
          >
            <Plus className="h-4 w-4" />
            {t("add")}
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const current = contacts[index];
              const user = current?.Id_Utilisateur ? usersById.get(current.Id_Utilisateur) : undefined;

              return (
                <div key={field.id} className="grid grid-cols-12 gap-3 rounded-md border p-3 items-end">
                  <div className="col-span-2 space-y-2">
                    <Label>{t("labels.priority")}</Label>
                    <Input
                      type="number"
                      min={1}
                      value={current?.Numero_Ordre ?? index + 1}
                      onChange={(event) =>
                        setValue(
                          `MailingContacts.${index}.Numero_Ordre`,
                          Math.max(1, Number(event.target.value) || 1),
                          { shouldDirty: true, shouldTouch: true },
                        )
                      }
                    />
                  </div>

                  <div className="col-span-5 space-y-2">
                    <Label>{t("labels.user")}</Label>
                    <Controller
                      control={control}
                      name={`MailingContacts.${index}.Id_Utilisateur`}
                      render={({ field: userField }) => (
                        <Select
                          value={userField.value != null ? String(userField.value) : ""}
                          onValueChange={(value) => {
                            userField.onChange(value ? Number(value) : null);
                            markMailingDirty();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("placeholders.user")} />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.displayName}
                                {u.email ? ` (${u.email})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="col-span-4 grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!current?.Est_Via_Email}
                        onCheckedChange={(checked) =>
                          setValue(`MailingContacts.${index}.Est_Via_Email`, !!checked, { shouldDirty: true, shouldTouch: true })
                        }
                      />
                      {t("labels.via_mail")}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={!!current?.Est_Via_Telephone} disabled aria-disabled />
                      {t("labels.via_phone")}
                    </label>
                    <p className="col-span-2 text-xs text-muted-foreground">{t("helpers.phone_coming_soon")}</p>
                    {user?.email ? (
                      <p className="text-xs text-muted-foreground col-span-2 truncate">{user.email}</p>
                    ) : null}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        remove(index);
                        markMailingDirty();
                      }}
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <label className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm">
          <Checkbox
            checked={applyMailingToGroups}
            disabled={groupIds.length === 0}
            onCheckedChange={(checked) =>
              setValue("Apply_Mailing_To_Groups", !!checked, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          />
          <span>
            <span className="block font-medium text-sky-950">{t("apply_groups_title")}</span>
            <span className="mt-1 block text-xs text-sky-800">
              {t("apply_groups_description")}
              {groupIds.length === 0 ? ` ${t("apply_groups_empty")}` : ""}
            </span>
          </span>
        </label>
      </div>
    </TabsContent>
  );
}
