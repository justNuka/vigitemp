'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import StepperFileUpload from '@/components/stepper-file-upload'

interface AdjustmentImportUploadDialogProps {
  open: boolean
  title: string
  description: string
  stepperSessionKey: number
  onOpenChange: (open: boolean) => void
  onUploadResult: Parameters<typeof StepperFileUpload>[0]['onUploadResult']
}

export function AdjustmentImportUploadDialog({
  open,
  title,
  description,
  stepperSessionKey,
  onOpenChange,
  onUploadResult,
}: AdjustmentImportUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[88vh] max-h-[88vh] overflow-hidden outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col">
          <StepperFileUpload key={stepperSessionKey} onUploadResult={onUploadResult} onFinish={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
