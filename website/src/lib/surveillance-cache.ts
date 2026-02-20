import type { QueryClient } from "@tanstack/react-query";

type PaginatedSensorsCache = {
  pages?: Array<{
    sensors?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export function markAlarmAcknowledgedInPaginatedSensorsCache(
  queryClient: QueryClient,
  acknowledgedAlarmId: number,
) {
  if (!Number.isFinite(acknowledgedAlarmId)) return;

  queryClient.setQueriesData({ queryKey: ["capteurs", "paginated"] }, (cached) => {
    const data = cached as PaginatedSensorsCache | undefined;
    if (!data?.pages) return cached;

    let changed = false;
    const nextPages = data.pages.map((page) => {
      if (!Array.isArray(page.sensors)) return page;

      let pageChanged = false;
      const nextSensors = page.sensors.map((sensor) => {
        const location = (sensor.location as Record<string, unknown> | undefined) ?? {};
        const sensorAlarmId = Number(sensor.alarmId ?? location.alarmId ?? NaN);

        if (!Number.isFinite(sensorAlarmId) || sensorAlarmId !== acknowledgedAlarmId) {
          return sensor;
        }

        pageChanged = true;
        changed = true;

        return {
          ...sensor,
          status: sensor.status === "ended" ? "ok" : sensor.status,
          alarmId: null,
          alarmType: null,
          location: {
            ...location,
            alarmId: null,
          },
        };
      });

      return pageChanged ? { ...page, sensors: nextSensors } : page;
    });

    return changed ? { ...data, pages: nextPages } : cached;
  });
}
