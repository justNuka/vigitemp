'use client';

import type { Profile } from '@/hooks/useProfiles';
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
import { useTranslations } from 'next-intl';

type DeleteProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  isDeleting: boolean;
  onDelete: () => void;
};

export function DeleteProfileDialog({
  open,
  onOpenChange,
  profile,
  isDeleting,
  onDelete,
}: DeleteProfileDialogProps) {
  const t = useTranslations('deleteProfileDialog');
  const isDeleteBlocked = !profile || profile.userCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', { name: profile?.name ?? '' })}
            {profile && profile.userCount > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                {t('blocked', { count: profile.userCount })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleteBlocked || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t('actions.deleting') : t('actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

