export type HealthState = "ok" | "error" | "unknown"

export type SystemHealthOverallState = "ok" | "degraded" | "error" | "unknown"

export interface SystemHealthSnapshot {
  checkedAt: string
  services: {
    web: {
      status: HealthState
      version: string
    }
    server: {
      status: HealthState
      configured: boolean
      version: string | null
    }
    dbMain: {
      status: HealthState
    }
    dbMesure: {
      status: HealthState
    }
    dbChat: {
      status: HealthState
      configured: boolean
    }
  }
  runtime: {
    hostname: string
    os: string
    architecture: string
    nodeVersion: string
    processUptimeSeconds: number
    systemUptimeSeconds: number
    databaseProvider: "mysql" | "sqlserver"
  }
}
