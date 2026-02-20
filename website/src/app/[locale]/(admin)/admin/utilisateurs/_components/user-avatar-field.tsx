"use client"

import { useMemo, useRef, useState } from "react"
import { useWatch, type Control } from "react-hook-form"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { AVATAR_PRESETS, getInitialsForAvatar, resolveAvatarSrc, toAvatarPresetValue } from "@/lib/avatar-library"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ImageCropDialog } from "@/components/image-crop-dialog"

function normalizeUploadedUrl(url: string | null | undefined) {
  if (!url) return ""
  return url
}

export function UserAvatarField<
  T extends { avatar?: string; prenom?: string; nom?: string; username?: string }
>({
  control,
}: {
  control: Control<T>
}) {
  const t = useTranslations("userForm")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)

  const avatarValue = useWatch({ control, name: "avatar" as any }) as string | undefined
  const firstName = useWatch({ control, name: "prenom" as any }) as string | undefined
  const lastName = useWatch({ control, name: "nom" as any }) as string | undefined
  const username = useWatch({ control, name: "username" as any }) as string | undefined
  const initials = getInitialsForAvatar(firstName, lastName, username)
  const avatarSrc = useMemo(() => resolveAvatarSrc(avatarValue, initials), [avatarValue, initials])

  const handleFileUpload = async (file: File, onChange: (value: string) => void) => {
    setIsUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)

      const res = await fetch("/api/utilisateurs/avatar/upload", {
        method: "POST",
        credentials: "include",
        body,
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.ok || !payload?.data?.url) {
        throw new Error(payload?.message || "upload_failed")
      }

      onChange(normalizeUploadedUrl(payload.data.url))
      toast.success(t('avatar.upload_success'))
    } catch {
      toast.error(t('avatar.upload_error'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FormField
      control={control}
      name={"avatar" as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("avatar.label")}</FormLabel>
          <div className="rounded-md border p-3 space-y-3">
            <ImageCropDialog
              open={isCropOpen}
              onOpenChange={setIsCropOpen}
              file={pendingCropFile}
              onConfirm={(file) => {
                void handleFileUpload(file, field.onChange)
                setPendingCropFile(null)
              }}
              title={t('avatar.crop_title')}
              cancelLabel={t('avatar.crop_cancel')}
              confirmLabel={t('avatar.crop_apply')}
              zoomLabel={t('avatar.crop_zoom')}
              resetLabel={t('avatar.crop_reset')}
            />
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={initials} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-3 w-3" />
                  {isUploading ? t("avatar.uploading") : t("avatar.upload")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange("")}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  {t("avatar.clear")}
                </Button>
              </div>
            </div>

            <FormControl>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setPendingCropFile(file)
                  setIsCropOpen(true)
                  toast.info(t('avatar.crop_opened'))
                  event.target.value = ""
                }}
              />
            </FormControl>

            <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
              {AVATAR_PRESETS.map((preset) => {
                const value = toAvatarPresetValue(preset.id)
                const previewSrc = resolveAvatarSrc(value, initials)
                const selected = field.value === value
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "rounded-md border p-1 transition",
                      selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40",
                    )}
                    onClick={() => field.onChange(value)}
                    title={preset.id}
                  >
                    <Avatar className="h-8 w-8 mx-auto">
                      {previewSrc ? <AvatarImage src={previewSrc} alt={preset.id} /> : null}
                      <AvatarFallback>
                        <ImagePlus className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                )
              })}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
