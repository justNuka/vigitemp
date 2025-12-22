export async function ServerAuditLogs(limit: number) {
  return [];
}

export async function ServerAuditStats() {
  return {
    totalEvents: 0,
    todayEvents: 0,
    criticalEvents: 0,
  };
}
