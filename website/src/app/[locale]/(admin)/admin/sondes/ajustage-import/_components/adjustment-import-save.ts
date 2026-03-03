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
  }
}

export async function saveAdjustmentsBulk(
  moduleId: number,
  rows: Array<{ id: string; file: string; insertData: unknown }>,
  t: TFunction,
) {
  const postBulk = async (confirmOverwrite: boolean) => {
    const response = await fetch('/api/sondes/ajustages/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, rows, confirmOverwrite }),
    })
    const payload = await response.json().catch(() => null)
    return { response, payload }
  }

  let { response, payload } = await postBulk(false)

  if (!response.ok && payload?.error?.code === 'confirmation_required') {
    const adjustmentList = (payload?.error?.details?.sensorsWithAdjustment as string[] | undefined) ?? []
    const offsetList = ((payload?.error?.details?.sensorsWithOffset as { Sonde_Numero_Serie?: string | null }[] | undefined) ?? [])
      .map((item) => item?.Sonde_Numero_Serie)
      .filter((item): item is string => !!item)

    const parts: string[] = []
    if (adjustmentList.length > 0) {
      parts.push(`${t('toast.confirm_adjustment_overwrite', { count: adjustmentList.length })} ${adjustmentList.join(', ')}`)
    }
    if (offsetList.length > 0) {
      parts.push(`${t('toast.confirm_offset_clear', { count: offsetList.length })} ${offsetList.join(', ')}`)
    }

    const confirmed = window.confirm(parts.join('\n\n'))
    if (!confirmed) {
      return { cancelled: true as const }
    }

    ;({ response, payload } = await postBulk(true))
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || t('toast.save_error'))
  }

  return { cancelled: false as const, payload: payload as BulkPayload }
}

export function notifyBulkSaveResult(payload: BulkPayload | undefined, t: TFunction) {
  const insertedCount = payload?.data?.inserted ?? 0
  const skippedCount = payload?.data?.skipped ?? 0
  const overwrittenAdjustments = payload?.data?.overwrittenAdjustments ?? 0
  const clearedOffsets = payload?.data?.clearedOffsets ?? 0
  const createdSensorsFromAdjustment = payload?.data?.createdSensorsFromAdjustment ?? 0
  const existingSensorsWithModule = payload?.data?.existingSensorsWithModule ?? 0

  if (insertedCount > 0) toast.success(t('toast.save_success', { count: insertedCount }))
  if (skippedCount > 0) toast.warning(t('toast.save_skipped', { count: skippedCount }))
  if (overwrittenAdjustments > 0) toast.success(t('toast.overwrite_done', { count: overwrittenAdjustments }))
  if (clearedOffsets > 0) toast.success(t('toast.offsets_cleared', { count: clearedOffsets }))
  if (createdSensorsFromAdjustment > 0) toast.success(t('toast.created_sensors_from_adjustment', { count: createdSensorsFromAdjustment }))
  if (existingSensorsWithModule > 0) toast.success(t('toast.existing_sensors_with_module', { count: existingSensorsWithModule }))
}
