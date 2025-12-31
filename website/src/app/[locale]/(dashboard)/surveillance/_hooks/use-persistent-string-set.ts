"use client"

import { useCallback, useEffect, useState } from "react"

type Options = {
  defaultValue?: string[]
}

export function usePersistentStringSet(storageKey: string, options: Options = {}) {
  const [value, setValue] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          setValue(new Set(JSON.parse(saved)))
        } else if (options.defaultValue && options.defaultValue.length > 0) {
          setValue(new Set(options.defaultValue))
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
    localStorage.setItem(storageKey, JSON.stringify(Array.from(value)))
  }, [isHydrated, storageKey, value])

  const toggle = useCallback((key: string) => {
    setValue((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const replace = useCallback((nextValues: string[]) => {
    setValue(new Set(nextValues))
  }, [])

  return { value, toggle, replace, isHydrated }
}
