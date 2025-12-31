"use client"

import { useCallback, useEffect, useState } from "react"

type Options = {
  defaultValue?: string
}

export function usePersistentStringValue(storageKey: string, options: Options = {}) {
  const [value, setValue] = useState<string | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved !== null) {
          setValue(saved || undefined)
        } else if (options.defaultValue) {
          setValue(options.defaultValue)
        }
      } catch (e) {
        console.error("Erreur lors de la lecture du localStorage:", e)
      }
      setIsHydrated(true)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [options.defaultValue, storageKey])

  useEffect(() => {
    if (!isHydrated) return

    if (!value) {
      localStorage.removeItem(storageKey)
      return
    }

    localStorage.setItem(storageKey, value)
  }, [isHydrated, storageKey, value])

  const set = useCallback((nextValue: string | undefined) => {
    setValue(nextValue || undefined)
  }, [])

  return { value, set, isHydrated }
}

