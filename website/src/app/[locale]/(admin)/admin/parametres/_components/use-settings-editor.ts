import { useEffect, useState } from "react"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { settingsApi } from "@/lib/api"

type Setting = {
  key: string
  value: string
  label: string
}

export function useSettingsEditor(initialSettings: Setting[]) {
  const router = useRouter()
  const t = useTranslations("adminSettings")
  const [settings, setSettings] = useState(initialSettings)
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => settingsApi.update(key, value),
  })

  const markLoading = (key: string) => {
    setLoadingKeys((prev) => new Set(prev).add(key))
  }

  const clearLoading = (key: string) => {
    setLoadingKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const updateLocalValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
  }

  const getCurrentValue = (key: string, fallback = "") => settings.find((setting) => setting.key === key)?.value ?? fallback

  const afterSuccess = (successMessage?: string, notifyStorage = false) => {
    setTimeout(() => {
      router.refresh()
    }, 100)

    if (notifyStorage) {
      window.dispatchEvent(new Event("storage"))
    }

    toast.success(successMessage ?? t("toast.update_success"))
  }

  const persist = (
    key: string,
    nextValue: string,
    options?: {
      successMessage?: string
      fallbackValue?: string
      notifyStorage?: boolean
    },
  ) => {
    const previousValue = getCurrentValue(key, options?.fallbackValue ?? "")
    updateLocalValue(key, nextValue)
    markLoading(key)

    updateMutation.mutate(
      { key, value: nextValue },
      {
        onSuccess: () => afterSuccess(options?.successMessage, options?.notifyStorage),
        onError: () => {
          updateLocalValue(key, previousValue)
          toast.error(t("toast.update_error"))
        },
        onSettled: () => clearLoading(key),
      },
    )
  }

  const toggle = (key: string) => {
    const currentValue = getCurrentValue(key, "false")
    const nextValue = currentValue === "true" ? "false" : "true"
    persist(key, nextValue, { fallbackValue: currentValue })
  }

  return {
    settings,
    loadingKeys,
    persist,
    toggle,
  }
}
