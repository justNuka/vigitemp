"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Control } from "react-hook-form"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import type { GroupOption, ProfileOption, SiteOption } from "./user-option-types"

export function UserNameFields<T extends { prenom: string; nom: string }>({
  control,
  order = "first-last",
}: {
  control: Control<T>
  order?: "first-last" | "last-first"
}) {
  const left = order === "first-last" ? "prenom" : "nom"
  const right = order === "first-last" ? "nom" : "prenom"

  const leftLabel = left === "prenom" ? "Prénom *" : "Nom *"
  const rightLabel = right === "prenom" ? "Prénom *" : "Nom *"

  const leftPlaceholder = left === "prenom" ? "Jean" : "Dupont"
  const rightPlaceholder = right === "prenom" ? "Jean" : "Dupont"

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

export function UserEmailField<T extends { email: string }>({ control }: { control: Control<T> }) {
  return (
    <FormField
      control={control}
      name={"email" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email *</FormLabel>
          <FormControl>
            <Input type="email" placeholder="jean.dupont@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserUsernameField<T extends { username: string }>({ control }: { control: Control<T> }) {
  return (
    <FormField
      control={control}
      name={"username" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Login *</FormLabel>
          <FormControl>
            <Input placeholder="jdupont" autoComplete="off" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserPhoneField<T extends { telephone?: string }>({ control }: { control: Control<T> }) {
  return (
    <FormField
      control={control}
      name={"telephone" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Téléphone</FormLabel>
          <FormControl>
            <Input placeholder="+33612345678" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function UserProfileField<T extends { profileId: string }>({
  control,
  profiles,
  isLoading,
  description,
}: {
  control: Control<T>
  profiles?: ProfileOption[]
  isLoading: boolean
  description?: string
}) {
  return (
    <FormField
      control={control}
      name={"profileId" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profil *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un profil" />
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

export function UserSitesField<T extends { siteIds?: number[] }>({
  control,
  sites,
  isLoading,
}: {
  control: Control<T>
  sites?: SiteOption[]
  isLoading: boolean
}) {
  return (
    <FormField
      control={control}
      name={"siteIds" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sites</FormLabel>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
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

export function UserGroupsField<T extends { groupeIds?: number[] }>({
  control,
  groups,
  isLoading,
}: {
  control: Control<T>
  groups?: GroupOption[]
  isLoading: boolean
}) {
  return (
    <FormField
      control={control}
      name={"groupeIds" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Groupes</FormLabel>
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
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
                    {group.Nom_Groupe ?? `Groupe ${group.Id_Groupe}`}
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

export function UserExpiryFields<T extends { hasExpiryDate: boolean; expiryDate?: Date }>({
  control,
  enabled,
}: {
  control: Control<T>
  enabled: boolean
}) {
  return (
    <>
      <FormField
        control={control}
        name={"hasExpiryDate" as any}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Date de validité</FormLabel>
              <FormDescription>Définir une date d'expiration</FormDescription>
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
              <FormLabel>Date d'expiration *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
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
