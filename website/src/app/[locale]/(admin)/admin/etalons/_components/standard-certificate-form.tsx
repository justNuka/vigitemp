'use client'

import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Upload } from 'lucide-react'

type Props = {
  standardId?: number | null
  existingPdfName?: string | null
}

export function StandardCertificateForm({ standardId, existingPdfName }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { control, setValue, watch } = useFormContext()
  const pdfId = watch('pdfId') as number | null | undefined
  const pdfName = (watch('pdfName') as string | null | undefined) ?? existingPdfName ?? null
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  async function handleUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    setIsUploading(true)

    try {
      const response = await fetch('/api/etalons/pdf', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.message || "Erreur lors de l'envoi du PDF")
      }

      setValue('pdfId', payload.data?.id ?? payload.id ?? null, { shouldDirty: true })
      setValue('pdfName', payload.data?.name ?? payload.name ?? file.name, { shouldDirty: true })
      setPreviewUrl(URL.createObjectURL(file))
    } finally {
      setIsUploading(false)
    }
  }

  function handlePreview() {
    if (previewUrl) {
      setPreviewOpen(true)
      return
    }

    if (standardId) {
      setPreviewUrl(`/api/etalons/${standardId}/pdf`)
      setPreviewOpen(true)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Certificat</h3>

        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Le certificat PDF sera stocke sur le serveur et restera accessible depuis cette fiche pour consultation et controle documentaire.
        </div>

        <FormField
          control={control}
          name="pdfId"
          render={() => (
            <FormItem>
              <FormLabel>Certificat PDF</FormLabel>
              <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    await handleUpload(file)
                    event.target.value = ''
                  }}
                />
                <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Envoi...' : 'Charger un PDF'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {pdfName || 'Aucun certificat charge'}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={handlePreview} disabled={!previewUrl && !standardId && !pdfId}>
                    Apercu
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setValue('pdfId', null, { shouldDirty: true })
                      setValue('pdfName', '', { shouldDirty: true })
                      setPreviewUrl(null)
                    }}
                    disabled={!pdfId && !pdfName}
                  >
                    Retirer
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Apercu du certificat</DialogTitle>
          </DialogHeader>
          {previewUrl ? (
            <iframe src={previewUrl} className="h-[75vh] w-full rounded-md border" title="Apercu certificat PDF" />
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">Aucun PDF a afficher.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
