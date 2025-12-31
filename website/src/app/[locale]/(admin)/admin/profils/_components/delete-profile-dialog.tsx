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
  const isDeleteBlocked = !profile || profile.userCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le profil</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le profil &quot;{profile?.name}&quot; ?
            {profile && profile.userCount > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                Attention : {profile.userCount} utilisateur{profile.userCount > 1 ? 's' : ''} utilise
                {profile.userCount > 1 ? 'nt' : ''} ce profil. La suppression est impossible.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleteBlocked || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

