import { apiRequest, setAuthToken, toArray } from "@/lib/api/client";
import type {
  AuthResponse,
  ClassRecord,
  ClassPayload,
  CurrentUser,
  AttendancePayload,
  AttendanceRecord,
  DepartmentPayload,
  DepartmentRecord,
  LoginPayload,
  ModulePayload,
  ModuleRecord,
  RoomPayload,
  RoomRecord,
  SessionPayload,
  SessionRecord,
  StaffPayload,
  StaffRecord,
  StaffUpdatePayload,
  StudentPayload,
  StudentRecord,
  StudentUpdatePayload,
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

export const departmentsApi = {
  list: async () => toArray<DepartmentRecord>(await apiRequest<unknown>("/departments")),
  get: (id: string) => apiRequest<DepartmentRecord>(`/departments/${id}`),
  create: (payload: DepartmentPayload) =>
    apiRequest<DepartmentRecord>("/departments", { method: "POST", body: json(payload) }),
  update: (id: string, payload: DepartmentPayload) =>
    apiRequest<DepartmentRecord>(`/departments/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/departments/${id}`, { method: "DELETE" }),
};

export const classesApi = {
  list: async () => toArray<ClassRecord>(await apiRequest<unknown>("/classes")),
  get: (id: string) => apiRequest<ClassRecord>(`/classes/${id}`),
  create: (payload: ClassPayload) =>
    apiRequest<ClassRecord>("/classes", { method: "POST", body: json(payload) }),
  update: (id: string, payload: ClassPayload) =>
    apiRequest<ClassRecord>(`/classes/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/classes/${id}`, { method: "DELETE" }),
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
  listByClass: async (classId: string) =>
    toArray<SessionRecord>(await apiRequest<unknown>(`/sessions?classId=${encodeURIComponent(classId)}`)),
  get: (id: string) => apiRequest<SessionRecord>(`/sessions/${id}`),
  create: (payload: SessionPayload) =>
    apiRequest<SessionRecord>("/sessions", { method: "POST", body: json(payload) }),
  update: (id: string, payload: SessionPayload) =>
    apiRequest<SessionRecord>(`/sessions/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/sessions/${id}`, { method: "DELETE" }),
};

export const staffApi = {
  list: async () => toArray<StaffRecord>(await apiRequest<unknown>("/staff")),
  get: (id: string) => apiRequest<StaffRecord>(`/staff/${id}`),
  create: (payload: StaffPayload) =>
    apiRequest<StaffRecord>("/staff", { method: "POST", body: json(payload) }),
  update: (id: string, payload: StaffUpdatePayload) =>
    apiRequest<StaffRecord>(`/staff/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/staff/${id}`, { method: "DELETE" }),
};

export const studentsApi = {
  list: async () => toArray<StudentRecord>(await apiRequest<unknown>("/students")),
  get: (id: string) => apiRequest<StudentRecord>(`/students/${id}`),
  create: (payload: StudentPayload) =>
    apiRequest<StudentRecord>("/students", { method: "POST", body: json(payload) }),
  update: (id: string, payload: StudentUpdatePayload) =>
    apiRequest<StudentRecord>(`/students/${id}`, { method: "PUT", body: json(payload) }),
  delete: (id: string) => apiRequest<void>(`/students/${id}`, { method: "DELETE" }),
  attendance: async (id: string) => toArray<AttendanceRecord>(await apiRequest<unknown>(`/students/${id}/attendance`)),
};

export const attendanceApi = {
  create: (payload: AttendancePayload) =>
    apiRequest<AttendanceRecord>("/attendance", { method: "POST", body: json(payload) }),
  bulkCreate: (payload: AttendancePayload[]) =>
    apiRequest<AttendanceRecord[]>("/attendance/bulk", { method: "POST", body: json(payload) }),
};
