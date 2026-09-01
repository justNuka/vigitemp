"use client"

import { Activity } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { useTranslations } from "next-intl"

export function SurveillanceEmptyState({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const t = useTranslations("surveillance.empty_state")
  const resolvedTitle = title ?? t("title")
  const resolvedDescription = description ?? t("description")

  return (
    <div className="p-4 md:p-6">
      <EmptyState title={resolvedTitle} description={resolvedDescription} icon={Activity} />
    </div>
  )
}

