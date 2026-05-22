"use client"

import { format } from "date-fns"
import { enUS, fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import type { GroupOption, ProfileOption, SiteOption } from "./user-option-types"

type UserFormFieldValues = FieldValues & {
  nom?: string
  prenom?: string
  email?: string
  username?: string
  telephone?: string
  profileId?: string
  siteIds?: number[]
  groupeIds?: number[]
  hasExpiryDate?: boolean
  expiryDate?: Date
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is number => typeof item === "number")
}

function toDate(value: unknown): Date | undefined {
  return value instanceof Date ? value : undefined
}

function toBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false
}

export function UserNameFields<TFormValues extends UserFormFieldValues>({
  control,
  order = "first-last",
}: {
  control: Control<TFormValues>
  order?: "first-last" | "last-first"
}) {
  const t = useTranslations("userForm")
  const left = order === "first-last" ? "prenom" : "nom"
  const right = order === "first-last" ? "nom" : "prenom"

  const leftLabel = left === "prenom" ? t("fields.first_name_label") : t("fields.last_name_label")
  const rightLabel = right === "prenom" ? t("fields.first_name_label") : t("fields.last_name_label")

  const leftPlaceholder = left === "prenom" ? t("placeholders.first_name") : t("placeholders.last_name")
  const rightPlaceholder = right === "prenom" ? t("placeholders.first_name") : t("placeholders.last_name")

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={left as FieldPath<TFormValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{leftLabel}</FormLabel>
            <FormControl>
              <Input placeholder={leftPlaceholder} {...field} value={typeof field.value === "string" ? field.value : ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={right as FieldPath<TFormValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{rightLabel}</FormLabel>
            <FormControl>
              <Input placeholder={rightPlaceholder} {...field} value={typeof field.value === "string" ? field.value : ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function UserEmailField<TFormValues extends UserFormFieldValues>({
  control,
}: {
  control: Control<TFormValues>
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"email" as FieldPath<TFormValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.email_label")}</FormLabel>
          <FormControl>
            <Input type="email" placeholder={t("placeholders.email")} {...field} value={typeof field.value === "string" ? field.value : ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserUsernameField<TFormValues extends UserFormFieldValues>({
  control,
}: {
  control: Control<TFormValues>
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"username" as FieldPath<TFormValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.username_label")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("placeholders.username")}
              autoComplete="off"
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserPhoneField<TFormValues extends UserFormFieldValues>({
  control,
}: {
  control: Control<TFormValues>
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"telephone" as FieldPath<TFormValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.phone_label")}</FormLabel>
          <FormControl>
            <Input placeholder={t("placeholders.phone")} {...field} value={typeof field.value === "string" ? field.value : ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserProfileField<TFormValues extends UserFormFieldValues>({
  control,
  profiles,
  isLoading,
  description,
}: {
  control: Control<TFormValues>
  profiles?: ProfileOption[]
  isLoading: boolean
  description?: string
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"profileId" as FieldPath<TFormValues>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.profile_label")}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={typeof field.value === "string" ? field.value : ""}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t("placeholders.profile")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {profiles?.map((profile) => (
                <SelectItem key={profile.id} value={profile.name}>
                  {profile.name}
                  {"description" in profile && profile.description ? (
                    <span className="ml-2 text-xs text-muted-foreground">({profile.description})</span>
                  ) : null}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserSitesField<TFormValues extends UserFormFieldValues>({
  control,
  sites,
  isLoading,
}: {
  control: Control<TFormValues>
  sites?: SiteOption[]
  isLoading: boolean
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"siteIds" as FieldPath<TFormValues>}
      render={({ field }) => {
        const selectedIds = toNumberArray(field.value)
        const siteIds = sites?.map((site) => site.id) ?? []
        const allSelected = siteIds.length > 0 && siteIds.every((id) => selectedIds.includes(id))

        return (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>{t("fields.sites_label")}</FormLabel>
              {siteIds.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => field.onChange(allSelected ? [] : siteIds)}
                >
                  {allSelected ? t("actions.uncheck_all") : t("actions.check_all")}
                </button>
              ) : null}
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t("actions.loading")}</p>
              ) : (
                sites?.map((site) => (
                  <div key={site.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`site-${site.id}`}
                      checked={selectedIds.includes(site.id)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...selectedIds, site.id]
                          : selectedIds.filter((id) => id !== site.id)

                        field.onChange(next)
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`site-${site.id}`} className="text-sm">
                      {site.name}
                    </label>
                  </div>
                ))
              )}
            </div>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function UserGroupsField<TFormValues extends UserFormFieldValues>({
  control,
  groups,
  isLoading,
}: {
  control: Control<TFormValues>
  groups?: GroupOption[]
  isLoading: boolean
}) {
  const t = useTranslations("userForm")

  return (
    <FormField
      control={control}
      name={"groupeIds" as FieldPath<TFormValues>}
      render={({ field }) => {
        const selectedIds = toNumberArray(field.value)
        const groupIds = groups?.map((group) => group.Id_Groupe) ?? []
        const allSelected = groupIds.length > 0 && groupIds.every((id) => selectedIds.includes(id))

        return (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>{t("fields.groups_label")}</FormLabel>
              {groupIds.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => field.onChange(allSelected ? [] : groupIds)}
                >
                  {allSelected ? t("actions.uncheck_all") : t("actions.check_all")}
                </button>
              ) : null}
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t("actions.loading")}</p>
              ) : (
                groups?.map((group) => (
                  <div key={group.Id_Groupe} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`groupe-${group.Id_Groupe}`}
                      checked={selectedIds.includes(group.Id_Groupe)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...selectedIds, group.Id_Groupe]
                          : selectedIds.filter((id) => id !== group.Id_Groupe)

                        field.onChange(next)
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`groupe-${group.Id_Groupe}`} className="text-sm">
                      {group.Nom_Groupe ?? t("groups.fallback", { id: group.Id_Groupe })}
                    </label>
                  </div>
                ))
              )}
            </div>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function UserExpiryFields<TFormValues extends UserFormFieldValues>({
  control,
  enabled,
}: {
  control: Control<TFormValues>
  enabled: boolean
}) {
  const t = useTranslations("userForm")
  const locale = useLocale()
  const dateLocale = locale.toLowerCase().startsWith("fr") ? fr : enUS

  return (
    <>
      <FormField
        control={control}
        name={"hasExpiryDate" as FieldPath<TFormValues>}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{t("expiry.title")}</FormLabel>
              <FormDescription>{t("expiry.description")}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={toBoolean(field.value)} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {enabled ? (
        <FormField
          control={control}
          name={"expiryDate" as FieldPath<TFormValues>}
          render={({ field }) => {
            const selectedDate = toDate(field.value)

            return (
              <FormItem className="flex flex-col">
                <FormLabel>{t("expiry.date_label")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !selectedDate && "text-muted-foreground")}
                      >
                        {selectedDate ? format(selectedDate, "PPP", { locale: dateLocale }) : <span>{t("expiry.select_date")}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={dateLocale}
                      selected={selectedDate}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      ) : null}
    </>
  )
}
