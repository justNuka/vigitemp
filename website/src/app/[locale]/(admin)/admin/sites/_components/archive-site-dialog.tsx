'use client';

import type { SiteAdmin } from '@/hooks/useSites';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('sitesDialog');
  const tCommon = useTranslations('common');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('archive_title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('archive_description', { code: site?.Libelle_Site || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!site || isArchiving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isArchiving ? t('submit_archiving') : t('submit_archive')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

