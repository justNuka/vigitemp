"use client"

import { format } from "date-fns"
import { enUS, fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Control } from "react-hook-form"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import type { GroupOption, ProfileOption, SiteOption } from "./user-option-types"

export function UserNameFields({
  control,
  order = "first-last",
}: {
  control: Control<any>
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
        name={left as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{leftLabel}</FormLabel>
            <FormControl>
              <Input placeholder={leftPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={right as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{rightLabel}</FormLabel>
            <FormControl>
              <Input placeholder={rightPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function UserEmailField({ control }: { control: Control<any> }) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"email" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.email_label")}</FormLabel>
          <FormControl>
            <Input type="email" placeholder={t("placeholders.email")} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserUsernameField({ control }: { control: Control<any> }) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"username" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.username_label")}</FormLabel>
          <FormControl>
            <Input placeholder={t("placeholders.username")} autoComplete="off" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserPhoneField({ control }: { control: Control<any> }) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"telephone" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.phone_label")}</FormLabel>
          <FormControl>
            <Input placeholder={t("placeholders.phone")} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserProfileField({
  control,
  profiles,
  isLoading,
  description,
}: {
  control: Control<any>
  profiles?: ProfileOption[]
  isLoading: boolean
  description?: string
}) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"profileId" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.profile_label")}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                    <span className="text-xs text-muted-foreground ml-2">({profile.description})</span>
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

export function UserSitesField({
  control,
  sites,
  isLoading,
}: {
  control: Control<any>
  sites?: SiteOption[]
  isLoading: boolean
}) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"siteIds" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.sites_label")}</FormLabel>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t("actions.loading")}</p>
            ) : (
              sites?.map((site) => (
                <div key={site.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`site-${site.id}`}
                    checked={field.value?.includes(site.id) || false}
                    onChange={(e) => {
                      const current = (field.value || []) as number[]
                      const next = e.target.checked ? [...current, site.id] : current.filter((id) => id !== site.id)
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
      )}
    />
  )
}

export function UserGroupsField({
  control,
  groups,
  isLoading,
}: {
  control: Control<any>
  groups?: GroupOption[]
  isLoading: boolean
}) {
  const t = useTranslations("userForm")
  return (
    <FormField
      control={control}
      name={"groupeIds" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("fields.groups_label")}</FormLabel>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border bg-background p-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t("actions.loading")}</p>
            ) : (
              groups?.map((group) => (
                <div key={group.Id_Groupe} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`groupe-${group.Id_Groupe}`}
                    checked={field.value?.includes(group.Id_Groupe) || false}
                    onChange={(e) => {
                      const current = (field.value || []) as number[]
                      const next = e.target.checked
                        ? [...current, group.Id_Groupe]
                        : current.filter((id) => id !== group.Id_Groupe)
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
      )}
    />
  )
}

export function UserExpiryFields({
  control,
  enabled,
}: {
  control: Control<any>
  enabled: boolean
}) {
  const t = useTranslations("userForm")
  const locale = useLocale()
  const dateLocale = locale.toLowerCase().startsWith("fr") ? fr : enUS

  return (
    <>
      <FormField
        control={control}
        name={"hasExpiryDate" as any}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{t("expiry.title")}</FormLabel>
              <FormDescription>{t("expiry.description")}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {enabled ? (
        <FormField
          control={control}
          name={"expiryDate" as any}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("expiry.date_label")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: dateLocale })
                      ) : (
                        <span>{t("expiry.select_date")}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  )
}
