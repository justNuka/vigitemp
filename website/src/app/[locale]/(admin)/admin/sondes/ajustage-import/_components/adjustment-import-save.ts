import { toast } from 'sonner'
import type { TFunction } from './types'

type BulkPayload = {
  data?: {
    inserted?: number
    skipped?: number
    overwrittenAdjustments?: number
    clearedOffsets?: number
    createdSensorsFromAdjustment?: number
    existingSensorsWithModule?: number
    gspCoefficientFallbackCount?: number
  }
}

type AdjustmentBulkSaveRow = {
  id: string
  file: string
  moduleId: number | null
  insertData: unknown
}

export type AdjustmentBulkSaveResult =
  | { status: 'saved'; payload: BulkPayload }
  | { status: 'confirmation_required'; adjustmentList: string[]; offsetList: string[] }

export async function saveAdjustmentsBulk(
  rows: AdjustmentBulkSaveRow[],
  t: TFunction,
  confirmOverwrite = false,
) : Promise<AdjustmentBulkSaveResult> {
  const postBulk = async (confirmOverwrite: boolean) => {
    const response = await fetch('/api/sondes/ajustages/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, confirmOverwrite }),
    })
    const payload = await response.json().catch(() => null)
    return { response, payload }
  }

  const { response, payload } = await postBulk(confirmOverwrite)

  if (!response.ok && payload?.error?.code === 'confirmation_required') {
    const adjustmentList = (payload?.error?.details?.sensorsWithAdjustment as string[] | undefined) ?? []
    const offsetList = ((payload?.error?.details?.sensorsWithOffset as { Sonde_Numero_Serie?: string | null }[] | undefined) ?? [])
      .map((item) => item?.Sonde_Numero_Serie)
      .filter((item): item is string => !!item)

    return {
      status: 'confirmation_required',
      adjustmentList,
      offsetList,
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || t('toast.save_error'))
  }

  return { status: 'saved', payload: payload as BulkPayload }
}

export function notifyBulkSaveResult(payload: BulkPayload | undefined, t: TFunction) {
  const insertedCount = payload?.data?.inserted ?? 0
  const skippedCount = payload?.data?.skipped ?? 0
  const overwrittenAdjustments = payload?.data?.overwrittenAdjustments ?? 0
  const clearedOffsets = payload?.data?.clearedOffsets ?? 0
  const createdSensorsFromAdjustment = payload?.data?.createdSensorsFromAdjustment ?? 0
  const existingSensorsWithModule = payload?.data?.existingSensorsWithModule ?? 0
  const gspCoefficientFallbackCount = payload?.data?.gspCoefficientFallbackCount ?? 0

  if (insertedCount > 0) toast.success(t('toast.save_success', { count: insertedCount }))
  if (skippedCount > 0) toast.warning(t('toast.save_skipped', { count: skippedCount }))
  if (overwrittenAdjustments > 0) toast.success(t('toast.overwrite_done', { count: overwrittenAdjustments }))
  if (clearedOffsets > 0) toast.success(t('toast.offsets_cleared', { count: clearedOffsets }))
  if (createdSensorsFromAdjustment > 0) toast.success(t('toast.created_sensors_from_adjustment', { count: createdSensorsFromAdjustment }))
  if (existingSensorsWithModule > 0) toast.success(t('toast.existing_sensors_with_module', { count: existingSensorsWithModule }))
  if (gspCoefficientFallbackCount > 0) toast.warning(t('toast.gsp_coefficients_fallback', { count: gspCoefficientFallbackCount }))
}
