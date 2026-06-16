import { apiRequest, setAuthToken, toArray } from "@/lib/api/client";
import type {
  AuthResponse,
  ClassRecord,
  CurrentUser,
  LoginPayload,
  ModulePayload,
  ModuleRecord,
  RoomPayload,
  RoomRecord,
  SessionPayload,
  SessionRecord,
} from "@/lib/api/types";

const json = (payload: unknown) => JSON.stringify(payload);

export const authApi = {
  async login(payload: LoginPayload, options: { remember?: boolean } = {}) {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: json(payload),
      auth: false,
    });
    const token = response.token ?? response.accessToken;

    if (token) {
      setAuthToken(token, options.remember ?? true);
    }

    return response;
  },
  me: () => apiRequest<CurrentUser>("/auth/me"),
};

export const modulesApi = {
  list: async () => toArray<ModuleRecord>(await apiRequest<unknown>("/modules")),
  get: (id: string) => apiRequest<ModuleRecord>(`/modules/${id}`),
  create: (payload: ModulePayload) =>
    apiRequest<ModuleRecord>("/modules", { method: "POST", body: json(payload) }),
  update: (id: string, payload: ModulePayload) =>
    apiRequest<ModuleRecord>(`/modules/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/modules/${id}`, { method: "DELETE" }),
};

export const classesApi = {
  list: async () => toArray<ClassRecord>(await apiRequest<unknown>("/classes")),
  get: (id: string) => apiRequest<ClassRecord>(`/classes/${id}`),
};

export const roomsApi = {
  list: async () => toArray<RoomRecord>(await apiRequest<unknown>("/rooms")),
  get: (id: string) => apiRequest<RoomRecord>(`/rooms/${id}`),
  create: (payload: RoomPayload) =>
    apiRequest<RoomRecord>("/rooms", { method: "POST", body: json(payload) }),
  update: (id: string, payload: RoomPayload) =>
    apiRequest<RoomRecord>(`/rooms/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/rooms/${id}`, { method: "DELETE" }),
};

export const sessionsApi = {
  list: async () => toArray<SessionRecord>(await apiRequest<unknown>("/sessions")),
  get: (id: string) => apiRequest<SessionRecord>(`/sessions/${id}`),
  create: (payload: SessionPayload) =>
    apiRequest<SessionRecord>("/sessions", { method: "POST", body: json(payload) }),
  update: (id: string, payload: SessionPayload) =>
    apiRequest<SessionRecord>(`/sessions/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/sessions/${id}`, { method: "DELETE" }),
};
