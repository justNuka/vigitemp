'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CurrentUser } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Upload, Trash2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { AVATAR_PRESETS, getInitialsForAvatar, resolveAvatarSrc, toAvatarPresetValue } from '@/lib/avatar-library'
import { cn } from '@/lib/utils'
import { ImageCropDialog } from '@/components/image-crop-dialog'
import { formatDbDateTime } from '@/lib/date-display'

const CROPPABLE_AVATAR_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])

type Props = {
  userInfo: CurrentUser | null | undefined
}

export function AccountInfoCard({ userInfo }: Props) {
  const t = useTranslations('profileAccount')
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [avatarValue, setAvatarValue] = useState<string>(userInfo?.Avatar_Utilisateur ?? '')
  const [isUploading, setIsUploading] = useState(false)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)

  useEffect(() => {
    setAvatarValue(userInfo?.Avatar_Utilisateur ?? '')
  }, [userInfo?.Avatar_Utilisateur])

  const initials = getInitialsForAvatar(userInfo?.Prenom, userInfo?.Nom, userInfo?.Login)
  const avatarPreview = useMemo(() => resolveAvatarSrc(avatarValue, initials), [avatarValue, initials])
  const originalAvatar = userInfo?.Avatar_Utilisateur ?? ''
  const hasPendingChange = avatarValue !== originalAvatar

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch('/api/me/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar: value || null }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.message || 'avatar_update_failed')
      }
      return payload.data as { avatar: string | null }
    },
    onSuccess: (data) => {
      const next = data.avatar ?? ''
      setAvatarValue(next)
      queryClient.setQueryData(['me'], (prev: CurrentUser | undefined) =>
        prev ? { ...prev, Avatar_Utilisateur: data.avatar ?? null } : prev,
      )
      toast.success(t('avatar.saved'))
    },
    onError: () => {
      toast.error(t('avatar.save_error'))
    },
  })

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)

      const res = await fetch('/api/me/avatar/upload', {
        method: 'POST',
        credentials: 'include',
        body,
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.ok || !payload?.data?.url) {
        throw new Error(payload?.message || 'avatar_upload_failed')
      }

      setAvatarValue(payload.data.url as string)
      toast.success(t('avatar.upload_success'))
    } catch {
      toast.error(t('avatar.upload_error'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageCropDialog
          open={isCropOpen}
          onOpenChange={setIsCropOpen}
          file={pendingCropFile}
          onConfirm={(file) => {
            void handleUpload(file)
            setPendingCropFile(null)
          }}
          title={t('avatar.crop_title')}
          cancelLabel={t('avatar.crop_cancel')}
          confirmLabel={t('avatar.crop_apply')}
          zoomLabel={t('avatar.crop_zoom')}
          resetLabel={t('avatar.crop_reset')}
        />

        <div className="rounded-md border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              {avatarPreview ? <AvatarImage key={avatarPreview} src={avatarPreview} alt={initials} /> : null}
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
                {isUploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-2 h-3 w-3" />}
                {isUploading ? t('avatar.uploading') : t('avatar.upload')}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarValue('')}>
                <Trash2 className="mr-2 h-3 w-3" />
                {t('avatar.clear')}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!hasPendingChange || saveMutation.isPending}
                onClick={() => saveMutation.mutate(avatarValue)}
              >
                {saveMutation.isPending ? t('avatar.saving') : t('avatar.save')}
              </Button>
            </div>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                if (!CROPPABLE_AVATAR_TYPES.has(file.type)) {
                  toast.error(t('avatar.upload_error'))
                  event.target.value = ''
                  return
                }
                setPendingCropFile(file)
                setIsCropOpen(true)
                toast.info(t('avatar.crop_opened'))
              }
              event.target.value = ''
            }}
          />

          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {AVATAR_PRESETS.map((preset) => {
              const value = toAvatarPresetValue(preset.id)
              const selected = avatarValue === value
              const previewSrc = resolveAvatarSrc(value, initials)
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={cn(
                    'rounded-md border p-1 transition',
                    selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40',
                  )}
                  onClick={() => setAvatarValue(value)}
                >
                  <Avatar className="h-8 w-8 mx-auto">
                    {previewSrc ? <AvatarImage key={previewSrc} src={previewSrc} alt={preset.id} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.login')}</label>
            <Input type="text" value={userInfo?.Login || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.email')}</label>
            <Input type="email" value={userInfo?.Adresse_Email || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.last_name')}</label>
            <Input type="text" value={userInfo?.Nom || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.first_name')}</label>
            <Input type="text" value={userInfo?.Prenom || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.profile')}</label>
            <Input type="text" value={userInfo?.profil || ''} readOnly className="cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('labels.created_at')}</label>
            <Input
              type="text"
              value={
                userInfo?.Date_Creation
                  ? formatDbDateTime(userInfo.Date_Creation, { dateOnly: true })
                  : ''
              }
              readOnly
              className="cursor-not-allowed opacity-75"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
