/**
 * API Client for Vigitemp Light Version
 * 
 * Centralized API calls using fetch for Next.js API Routes
 */

const API_BASE = "/api";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "Une erreur est survenue");
  }

  return response.json();
}

// Dashboard
export const dashboardApi = {
  getStats: () => fetcher<DashboardStats>("/dashboard/stats"),
  getRecentMeasurements: (limit = 10) =>
    fetcher<Measurement[]>(`/dashboard/measurements?limit=${limit}`),
  getCriticalSensors: () => fetcher<SensorWithLocation[]>("/dashboard/critical-sensors"),
};

// Sensors
export const sensorsApi = {
  getAll: (params?: { locationId?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<SensorWithLocation[]>(`/sensors${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => fetcher<SensorWithLocation>(`/sensors/${id}`),
  create: (data: CreateSensorInput) =>
    fetcher<Sensor>("/sensors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateSensorInput) =>
    fetcher<Sensor>(`/sensors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetcher<void>(`/sensors/${id}`, {
      method: "DELETE",
    }),
};

// Alarms
export const alarmsApi = {
  getActive: () => fetcher<AlarmWithDetails[]>("/alarms?status=active"),
  getAll: (params?: { status?: string; locationId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<AlarmWithDetails[]>(`/alarms${query ? `?${query}` : ""}`);
  },
  acknowledge: (id: string, comment?: string) =>
    fetcher<Alarm>(`/alarms/${id}/acknowledge`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    }),
  resolve: (id: string) =>
    fetcher<Alarm>(`/alarms/${id}/resolve`, {
      method: "POST",
    }),
};

// Locations
export const locationsApi = {
  getAll: (params?: { siteGroup?: string; isActive?: boolean }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetcher<Location[]>(`/locations${query ? `?${query}` : ""}`);
  },
  getById: (id: string) => fetcher<Location>(`/locations/${id}`),
  create: (data: CreateLocationInput) =>
    fetcher<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateLocationInput) =>
    fetcher<Location>(`/locations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Users (admin only)
export const usersApi = {
  getAll: () => fetcher<User[]>("/users"),
  getById: (id: string) => fetcher<User>(`/users/${id}`),
  create: (data: CreateUserInput) =>
    fetcher<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateUserInput) =>
    fetcher<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetcher<void>(`/users/${id}`, {
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
  getAll: () => fetcher<Setting[]>("/settings"),
  get: (key: string) => fetcher<Setting>(`/settings/${key}`),
  update: (key: string, value: string) =>
    fetcher<Setting>(`/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),
  getPasswordRules: () => fetcher<PasswordRules>("/settings/password-rules"),
};

// Groups
export const groupsApi = {
  getAll: () => fetcher<Group[]>("/groups"),
};

// Sites
export const sitesApi = {
  getAll: () => fetcher<Site[]>("/sites"),
};

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    fetcher<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    fetcher<void>("/auth/logout", {
      method: "POST",
    }),
  getCurrentUser: () => fetcher<User>("/auth/me"),
};

// Types (will be imported from Prisma later)
export type DashboardStats = {
  totalLocations: number;
  activeAlarms: number;
  okSensors: number;
  warningSensors: number;
  criticalSensors: number;
};

export type Measurement = {
  timestamp: Date;
  value: number;
  sensorId: string;
};

export type SensorWithLocation = {
  id: string;
  name: string;
  type: string;
  unit: string;
  currentValue: number | null;
  minThreshold: number;
  maxThreshold: number;
  lastMeasurement: Date | null;
  isActive: boolean;
  location: Location;
  status: "ok" | "warning" | "critical";
};

export type AlarmWithDetails = {
  id: string;
  sensorId: string;
  locationId: string;
  type: "high" | "low";
  value: number;
  threshold: number;
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
  description: string | null;
  siteGroup: string | null;
  isActive: boolean;
};

export type Sensor = {
  id: string;
  name: string;
  type: string;
  unit: string;
  locationId: string;
  minThreshold: number;
  maxThreshold: number;
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
  type: "high" | "low";
  value: number;
  threshold: number;
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
  role: "admin" | "user";
  isActive: boolean;
  createdAt: Date;
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
  history_count: number;
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
  role: "admin" | "user";
};
export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  password?: string;
};
