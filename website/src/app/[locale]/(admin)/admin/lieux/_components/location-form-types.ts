'use client'

import type { LocationRow } from '@/hooks/useLocations'

export type LocationFormMode = 'create' | 'edit'
export type LocationFormData = Partial<LocationRow> & {
	GroupIds: number[]
	Applied_Etalonnage_Id?: number | null
	Commentaire_Action?: string | null
}

