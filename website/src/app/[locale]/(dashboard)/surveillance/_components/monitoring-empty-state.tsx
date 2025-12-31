"use client"

import { Activity } from "lucide-react"

import { EmptyState } from "@/components/empty-state"

export function SurveillanceEmptyState({
  title = "Aucune sonde",
  description = "Aucune donnée disponible pour le moment.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="p-4 md:p-6">
      <EmptyState title={title} description={description} icon={Activity} />
    </div>
  )
}

