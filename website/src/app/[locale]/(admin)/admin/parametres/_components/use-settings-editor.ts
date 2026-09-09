import { useEffect, useMemo, useState } from "react"

import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { useRouter } from "@/i18n/navigation"
import { settingsApi } from "@/lib/api"

type Setting = {
  key: string
  value: string
  label: string
}

const STORAGE_EVENT_KEYS = new Set(["dashboard:surveillance_refresh", "general:timezone"])

export function useSettingsEditor(initialSettings: Setting[]) {
  const router = useRouter()
  const t = useTranslations("adminSettings")
  const [settings, setSettings] = useState(initialSettings)
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const initialSettingsMap = useMemo(
    () => new Map(initialSettings.map((setting) => [setting.key, setting.value])),
    [initialSettings],
  )

  const dirtyKeys = useMemo(
    () =>
      settings
        .filter((setting) => initialSettingsMap.get(setting.key) !== setting.value)
        .map((setting) => setting.key),
    [initialSettingsMap, settings],
  )

  const dirtyKeySet = useMemo(() => new Set(dirtyKeys), [dirtyKeys])

  const setDraftValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
  }

  const toggleDraft = (key: string) => {
    const currentValue = settings.find((setting) => setting.key === key)?.value ?? "false"
    const nextValue = currentValue === "true" ? "false" : "true"
    setDraftValue(key, nextValue)
  }

  const discardChanges = () => {
    setSettings(initialSettings)
    toast.message(t("toast.changes_discarded"))
  }

  const saveChanges = async () => {
    if (dirtyKeys.length === 0) return

    const keysToSave = new Set(dirtyKeys)
    setLoadingKeys(keysToSave)

    try {
      await Promise.all(
        settings
          .filter((setting) => keysToSave.has(setting.key))
          .map((setting) => settingsApi.update(setting.key, setting.value)),
      )

      if (dirtyKeys.some((key) => STORAGE_EVENT_KEYS.has(key))) {
        window.dispatchEvent(new Event("storage"))
      }

      toast.success(t("toast.update_success"))
      router.refresh()
    } catch {
      toast.error(t("toast.update_error"))
      router.refresh()
    } finally {
      setLoadingKeys(new Set())
    }
  }

  return {
    settings,
    loadingKeys,
    dirtyKeys,
    dirtyKeySet,
    hasPendingChanges: dirtyKeys.length > 0,
    setDraftValue,
    toggleDraft,
    discardChanges,
    saveChanges,
  }
}
