import type { LocationRow } from '@/hooks/useLocations'
import type { LocationFormData } from './location-form-types'

export function mapLocationToFormData(location: LocationRow): LocationFormData {
  const selectedGroupIds = Array.from(
    new Set(
      [
        ...(location.t_lieu_groupe?.map((lg) => lg.Id_Groupe) ?? []),
        location.Id_Groupe1 ?? undefined,
        location.Id_Groupe2 ?? undefined,
      ].filter((value): value is number => typeof value === 'number' && !Number.isNaN(value)),
    ),
  )

  return {
    ...location,
    GroupIds: selectedGroupIds,
  }
}

