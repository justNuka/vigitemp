import type { AlarmWithDetails } from "@/lib/api"

export interface AlarmRow {
  id: string
  type: "high" | "low" | "no-response" | "ended"
  location: AlarmWithDetails["location"]
  sensor: AlarmWithDetails["sensor"]
  value: number | null
  threshold: number | null
  triggeredAt: string | Date
  status: string
  comment: string | null
}
