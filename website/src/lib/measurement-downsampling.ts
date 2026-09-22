import {
  getMeasureTimestamp,
  type MeasureData,
} from "@/lib/measurements"

export const MONITORING_CARD_GRAPH_MAX_POINTS = 180
export const MONITORING_DETAIL_GRAPH_MAX_POINTS = 600

type DownsampledMeasurements = {
  measurements: MeasureData[]
  sourceCount: number
  sampled: boolean
}

function isNullMeasure(point: MeasureData) {
  return point.Valeur === null ||
    (typeof point.Est_Valeur_Null === "number"
      ? point.Est_Valeur_Null !== 0
      : Boolean(point.Est_Valeur_Null))
}

function isMemoryMeasure(point: MeasureData) {
  return typeof point.Est_Valeur_Memoire === "number"
    ? point.Est_Valeur_Memoire !== 0
    : Boolean(point.Est_Valeur_Memoire)
}

function hasThresholdChange(previous: MeasureData | undefined, current: MeasureData) {
  if (!previous) return false
  return (
    previous.Consigne !== current.Consigne ||
    previous.Consigne_Sup !== current.Consigne_Sup ||
    previous.Consigne_Inf !== current.Consigne_Inf
  )
}

function selectEvenly(measurements: MeasureData[], maxPoints: number) {
  if (measurements.length <= maxPoints) return measurements
  if (maxPoints <= 1) return measurements.slice(0, 1)

  const selected = new Set<number>([0, measurements.length - 1])
  const interiorSlots = Math.max(0, maxPoints - 2)

  for (let slot = 1; slot <= interiorSlots; slot += 1) {
    const index = Math.round(
      (slot * (measurements.length - 1)) / (interiorSlots + 1),
    )
    selected.add(index)
  }

  return Array.from(selected)
    .sort((left, right) => left - right)
    .slice(0, maxPoints)
    .map((index) => measurements[index])
}

export function downsampleMeasurementsForGraph(
  measurements: MeasureData[],
  requestedMaxPoints: number,
): DownsampledMeasurements {
  const sourceCount = measurements.length
  const maxPoints = Math.max(2, Math.floor(requestedMaxPoints))

  if (sourceCount <= maxPoints) {
    return {
      measurements,
      sourceCount,
      sampled: false,
    }
  }

  // Very small limits are only useful for tests/defensive callers.
  if (maxPoints < 7) {
    return {
      measurements: selectEvenly(measurements, maxPoints),
      sourceCount,
      sampled: true,
    }
  }

  // Each bucket may contribute at most:
  // - first + last values,
  // - local minimum + maximum,
  // - one operationally significant point (gap, memory recovery or threshold change).
  const bucketCapacity = 5
  const bucketCount = Math.max(1, Math.floor((maxPoints - 2) / bucketCapacity))
  const buckets = Array.from({ length: bucketCount }, () => [] as number[])

  const firstTimestamp = getMeasureTimestamp(measurements[0])
  const lastTimestamp = getMeasureTimestamp(measurements[sourceCount - 1])
  const canBucketByTime =
    Number.isFinite(firstTimestamp) &&
    Number.isFinite(lastTimestamp) &&
    lastTimestamp > firstTimestamp

  for (let index = 1; index < sourceCount - 1; index += 1) {
    let bucketIndex: number

    if (canBucketByTime) {
      const timestamp = getMeasureTimestamp(measurements[index])
      if (Number.isFinite(timestamp)) {
        const ratio = (timestamp - firstTimestamp) / (lastTimestamp - firstTimestamp)
        bucketIndex = Math.floor(ratio * bucketCount)
      } else {
        bucketIndex = Math.floor(((index - 1) / (sourceCount - 2)) * bucketCount)
      }
    } else {
      bucketIndex = Math.floor(((index - 1) / (sourceCount - 2)) * bucketCount)
    }

    buckets[Math.max(0, Math.min(bucketCount - 1, bucketIndex))].push(index)
  }

  const selected = new Set<number>([0, sourceCount - 1])

  for (const indexes of buckets) {
    if (indexes.length === 0) continue

    const firstIndex = indexes[0]
    const lastIndex = indexes[indexes.length - 1]
    selected.add(firstIndex)
    selected.add(lastIndex)

    let minIndex = -1
    let maxIndex = -1
    let minValue = Number.POSITIVE_INFINITY
    let maxValue = Number.NEGATIVE_INFINITY
    let specialIndex = -1

    for (const index of indexes) {
      const point = measurements[index]

      if (typeof point.Valeur === "number" && Number.isFinite(point.Valeur)) {
        if (point.Valeur < minValue) {
          minValue = point.Valeur
          minIndex = index
        }
        if (point.Valeur > maxValue) {
          maxValue = point.Valeur
          maxIndex = index
        }
      }

      if (
        specialIndex < 0 &&
        (
          isNullMeasure(point) ||
          isMemoryMeasure(point) ||
          hasThresholdChange(measurements[index - 1], point)
        )
      ) {
        specialIndex = index
      }
    }

    if (minIndex >= 0) selected.add(minIndex)
    if (maxIndex >= 0) selected.add(maxIndex)
    if (specialIndex >= 0) selected.add(specialIndex)
  }

  const sampled = Array.from(selected)
    .sort((left, right) => left - right)
    .slice(0, maxPoints)
    .map((index) => measurements[index])

  return {
    measurements: sampled,
    sourceCount,
    sampled: sampled.length < sourceCount,
  }
}
