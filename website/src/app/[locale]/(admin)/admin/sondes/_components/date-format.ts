import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDateTimeFr(date: Date | null) {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: fr });
}

export function formatDateFr(date: Date | null) {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
}

