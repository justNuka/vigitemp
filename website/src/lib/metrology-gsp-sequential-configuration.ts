export type SequentialMetrologyConfigurationOptions<T> = {
  apply: (item: T) => Promise<void>
  rollback: (item: T) => Promise<void>
  rollbackOnFailure: boolean
  onRollbackError?: (item: T, error: unknown) => void
}

export async function runSequentialMetrologyConfiguration<T>(
  items: readonly T[],
  options: SequentialMetrologyConfigurationOptions<T>,
): Promise<T[]> {
  const applied: T[] = []

  try {
    for (const item of items) {
      await options.apply(item)
      applied.push(item)
    }
    return applied
  } catch (error) {
    if (options.rollbackOnFailure) {
      for (const item of [...applied].reverse()) {
        try {
          await options.rollback(item)
        } catch (rollbackError) {
          options.onRollbackError?.(item, rollbackError)
        }
      }
    }
    throw error
  }
}
