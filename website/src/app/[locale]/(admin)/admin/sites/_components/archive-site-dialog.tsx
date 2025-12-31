'use client';

import type { SiteAdmin } from '@/hooks/useSites';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ArchiveSiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SiteAdmin | null;
  isArchiving: boolean;
  onConfirm: () => void;
};

export function ArchiveSiteDialog({
  open,
  onOpenChange,
  site,
  isArchiving,
  onConfirm,
}: ArchiveSiteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver le site</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir archiver le site <strong>{site?.Code_Site}</strong> ? Cette action ne peut être
            annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!site || isArchiving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isArchiving ? 'Archivage...' : 'Archiver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

