/**
 * API Client for VigiSensys
 *
 * Centralized API calls using fetch for Next.js API Routes.
 *
 * Note: this uses `fetchJson` so errors are `HttpError` (status available),
 * which allows us to stop periodic polling on 401 (logged out).
 */

import { fetchJson } from "@/lib/http"

const API_BASE = "/api"

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  }

  return fetchJson<T>(`${API_BASE}${url}`, {
    credentials: "include",
    ...options,
    headers,
  })
}

// Dashboard
export const dashboardApi = {
  getStats: () => fetcher<DashboardStats>("/tableau-de-bord/stats"),
  getRecentMeasurements: (limit = 10) =>
    fetcher<Measurement[]>(`/tableau-de-bord/measurements?limit=${limit}`),
  getCriticalSensors: () =>
    fetcher<SensorWithLocation[]>("/tableau-de-bord/critical-sensors"),
};

// Sensors
export const sensorsApi = {
  getAll: (params?: { locationId?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<SensorWithLocation[]>(`/capteurs${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => fetcher<SensorWithLocation>(`/capteurs/${id}`),
  create: (data: CreateSensorInput) =>
    fetcher<Sensor>("/capteurs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateSensorInput) =>
    fetcher<Sensor>(`/capteurs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetcher<void>(`/capteurs/${id}`, {
      method: "DELETE",
    }),
};

// Alarms
export const alarmsApi = {
  getActive: () => fetcher<AlarmWithDetails[]>("/alarmes?status=active"),
  getAll: (params?: { status?: string; locationId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<AlarmWithDetails[]>(`/alarmes${query ? `?${query}` : ""}`);
  },
  acknowledge: (id: string, comment?: string) =>
    fetcher<Alarm>(`/alarmes/${id}/acknowledge`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    }),
  resolve: (id: string) =>
    fetcher<Alarm>(`/alarmes/${id}/resolve`, {
      method: "POST",
    }),
};

// Locations
export const locationsApi = {
  getAll: (params?: { siteGroup?: string; isActive?: boolean }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<Location[]>(`/lieux/resume${query ? `?${query}` : ""}`);
  },
  create: (data: CreateLocationInput) =>
    fetcher<Location>("/lieux/resume", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Users (admin only)
export const usersApi = {
  getAll: () => fetcher<User[]>("/utilisateurs"),
  getById: (id: string) => fetcher<User>(`/utilisateurs/${id}`),
  create: (data: CreateUserInput) =>
    fetcher<User>("/utilisateurs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserInput) =>
    fetcher<User>(`/utilisateurs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  reactivate: (id: string) =>
    fetcher<User>(`/utilisateurs/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ reactivate: true }),
    }),
  delete: (id: string) =>
    fetcher<void>(`/utilisateurs/${id}`, {
      method: "DELETE",
    }),
};

// Audit Logs
export const auditApi = {
  getAll: (params?: { userId?: string; action?: string; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<AuditLog[]>(`/audit${query ? `?${query}` : ""}`);
  },
};

// Settings
export const settingsApi = {
  getAll: () => fetcher<Setting[]>("/parametres"),
  get: (key: string) => fetcher<Setting>(`/parametres/${key}`),
  update: (key: string, value: string) =>
    fetcher<Setting>(`/parametres/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),
  getPasswordRules: () => fetcher<PasswordRules>("/parametres/password-rules"),
};

// Groups
type RawGroup = { Id_Groupe: number; Nom_Groupe?: string | null }

export const groupsApi = {
  getAll: async () => {
    const groups = await fetcher<RawGroup[]>("/groupes");
    return (groups ?? [])
      .filter((g) => g && typeof g.Id_Groupe === "number")
      .map((g) => ({
        id: g.Id_Groupe,
        name: g.Nom_Groupe || "Sans nom",
      }));
  },
};

// Sites
export const sitesApi = {
  getAll: () => fetcher<Site[]>("/sites"),
};

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    fetcher<{
      id: number;
      username: string;
      displayName: string;
      profile: string;
      authorizations: string[];
      token: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    fetcher<void>("/auth/logout", {
      method: "POST",
    }),
  getCurrentUser: () => fetcher<CurrentUser>("/me"),
};

// Types (will be imported from Prisma later)
import { CurrentUser } from "@/lib/types";

export type DashboardStats = {
  totalLocations: number;
  activeLocations: number;
  disabledLocations: number;
  activeAlarms: number;
  alertSensors: number;
};

export type Measurement = {
  timestamp: string;
  value: number;
  sensorId: string;
};

export type SensorWithLocation = {
  id: string;
  name: string;
  type: string;
  unit: string;
  decimals?: number | null;
  currentValue: number | null;
  minThreshold: number | null;
  maxThreshold: number | null;
  lastMeasurement: Date | null;
  isActive: boolean;
  location: Location;
  status: "ok" | "warning" | "critical" | "technical" | "ended";
  lieuType?: string | null;
  alarmId?: number | null;
  alarmType?: "H" | "B" | "N" | "S" | "M" | "T" | null;
};

export type AlarmWithDetails = {
  id: string;
  sensorId: string;
  locationId: string;
  type: "high" | "low" | "no-response" | "sector" | "module" | "ended";
  value: number | null;
  threshold: number | null;
  status: "active" | "acknowledged" | "resolved";
  triggeredAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  acknowledgedBy: string | null;
  comment: string | null;
  sensor: Sensor;
  location: Location;
};

export type Location = {
  id: string;
  name: string;
  description?: string | null;
  siteGroup?: string | null;
  isActive?: boolean;
  alarmDisabled?: boolean;
  estSonAlarmeActive?: boolean | null;
  alarmDisabledUntil?: Date | null;
  alarmDelayMinutes?: number | null;
  alarmDelayHighMinutes?: number | null;
  alarmDelayLowMinutes?: number | null;
  noResponseDelayMinutes?: number | null;
  consigneSupPreAlarme?: number | null;
  estConsigneSupPreAlarmeActive?: boolean | null;
  consigneInfPreAlarme?: number | null;
  estConsigneInfPreAlarmeActive?: boolean | null;
  comment?: string | null;
  lieuEtat?: string | null;
  surveillanceDisabled?: boolean;
  surveillanceDisabledSince?: Date | null;
  surveillanceDisabledBy?: string | null;
  surveillanceDisabledComment?: string | null;
  lieuType?: string | null;
  alarmId?: number | null;
  isGso?: boolean | null;
  gsoRssi?: string | null;
  batteryPercent?: number | null;
  gsoTension?: string | null;
  siteId?: number;
  groupIds?: number[];
  groupNames?: string[];
  groupId1?: number | null;
  groupId2?: number | null;
  groupName1?: string | null;
  groupName2?: string | null;
  site?: string;
  sondeNumeroSerie?: string | null;
};

export type Sensor = {
  id: string;
  name: string;
  type: string;
  unit: string;
  locationId: string;
  minThreshold: number | null;
  maxThreshold: number | null;
  currentValue: number | null;
  measurementFrequency: number;
  alarmDelay: number;
  isActive: boolean;
  lastMeasurement: Date | null;
};

export type Alarm = {
  id: string;
  sensorId: string;
  locationId: string;
  type: "high" | "low" | "no-response" | "sector" | "module";
  value: number | null;
  threshold: number | null;
  status: "active" | "acknowledged" | "resolved";
  triggeredAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  acknowledgedBy: string | null;
  comment: string | null;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  avatar?: string | null;
};

export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  targetType: string | null;
  targetId: string | null;
  timestamp: Date;
  ipAddress: string | null;
  commentaireUtilisateur?: string | null;
  profileUtilisateur?: string | null;
};

export type Setting = {
  key: string;
  value: string;
  description: string | null;
};

export type Group = {
  id: number;
  name: string;
};

export type Site = {
  id: number;
  name: string;
};

export type PasswordRules = {
  min_length: number;
  min_uppercase: number;
  min_lowercase: number;
  min_numbers: number;
  min_special: number;
  // CFR21 parameters
  cfr21_enabled: boolean;
  history_count: number;
  expiry_days: number;
  expiry_enabled: boolean;
};

export type CreateSensorInput = Omit<
  Sensor,
  "id" | "currentValue" | "lastMeasurement"
>;
export type UpdateSensorInput = Partial<CreateSensorInput>;

export type CreateLocationInput = Omit<Location, "id">;
export type UpdateLocationInput = Partial<CreateLocationInput>;

export type CreateUserInput = {
  username: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
  profileId: string;
  telephone?: string;
  expiryDate?: Date;
  avatar?: string | null;
};
export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  password?: string;
  reactivate?: boolean;
};

