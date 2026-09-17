import type {
  HealthState,
  SystemHealthOverallState,
  SystemHealthSnapshot,
} from "@/types/system-health"

export type SystemHealthOverview = {
  status: SystemHealthOverallState
  ok: number
  total: number
  errors: number
  unknown: number
}

export function getSystemHealthOverview(snapshot: SystemHealthSnapshot): SystemHealthOverview {
  const criticalStates: HealthState[] = [
    snapshot.services.web.status,
    snapshot.services.server.status,
    snapshot.services.dbMain.status,
    snapshot.services.dbMesure.status,
  ]

  const relevantStates: HealthState[] = [...criticalStates]
  if (snapshot.services.dbChat.configured) {
    relevantStates.push(snapshot.services.dbChat.status)
  }

  const ok = relevantStates.filter((status) => status === "ok").length
  const errors = relevantStates.filter((status) => status === "error").length
  const unknown = relevantStates.filter((status) => status === "unknown").length

  let status: SystemHealthOverallState = "ok"
  if (criticalStates.some((state) => state === "error")) {
    status = "error"
  } else if (criticalStates.some((state) => state === "unknown")) {
    status = "unknown"
  } else if (
    snapshot.services.dbChat.configured &&
    snapshot.services.dbChat.status !== "ok"
  ) {
    status = "degraded"
  }

  return {
    status,
    ok,
    total: relevantStates.length,
    errors,
    unknown,
  }
}
