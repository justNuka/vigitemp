import type { LocationRow } from '@/hooks/useLocations'
import type { LocationFormData } from './location-form-types'

export function mapLocationToFormData(location: LocationRow): LocationFormData {
  const selectedGroupIds = Array.from(
    new Set(
      [...(location.t_lieu_groupe?.map((lg) => lg.Id_Groupe) ?? [])].filter(
        (value): value is number => typeof value === 'number' && !Number.isNaN(value),
      ),
    ),
  )

  const mailingContacts = [...(location.MailingContacts ?? [])]
    .sort((a, b) => (a.Numero_Ordre ?? 0) - (b.Numero_Ordre ?? 0))
    .map((contact, idx) => ({
      Id_Tel_Num: contact.Id_Tel_Num,
      Numero_Ordre: contact.Numero_Ordre ?? idx + 1,
      Id_Utilisateur: contact.Id_Utilisateur ?? null,
      Est_Via_Telephone: !!contact.Est_Via_Telephone,
      Est_Via_Email: !!contact.Est_Via_Email,
    }))

  return {
    ...location,
    GroupIds: selectedGroupIds,
    MailingContacts: mailingContacts,
    Apply_Mailing_To_Groups: false,
  }
}

