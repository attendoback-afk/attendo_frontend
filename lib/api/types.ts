export type ApiEntity = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export const AUTH_ROLES = ["MANAGER", "PROFESSOR", "ASSISTANT"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const DAY_OF_WEEK_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export type CurrentUser = ApiEntity & {
  user: {
    name: string;
    email: string;
    role: AuthRole;
  };
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: CurrentUser;
};

export const STAFF_ROLE_VALUES = ["MANAGER", "PROFESSOR", "ASSISTANT"] as const;

export type StaffRole = (typeof STAFF_ROLE_VALUES)[number];

export type LoginPayload = {
  email: string;
  password: string;
};

export type ModuleRecord = ApiEntity & {
  name: string;
  code: string;
  description?: string | null;
};

export type ModulePayload = {
  name: string;
  code: string;
  description?: string | null;
};

export type DepartmentRecord = ApiEntity & {
  name: string;
  description?: string | null;
};

export type DepartmentPayload = {
  name: string;
  description: string;
};

export type ClassRecord = ApiEntity & {
  name: string;
  code?: string;
  classCode?: string;
  year?: number | string | null;
  level?: string | number | null;
  description?: string | null;
  departmentId?: string | number;
  department?: {
    id: string | number;
    name: string;
    description?: string | null;
  };
};

export type ClassPayload = {
  name: string;
  classCode: string;
  departmentId: number;
  year: number;
  description: string;
};

export type RoomRecord = ApiEntity & {
  name: string;
  building?: string | null;
  capacity?: number | null;
};

export type RoomPayload = {
  name: string;
  building?: string | null;
  capacity?: number | null;
};

export type SessionRecord = ApiEntity & {
  classId: string;
  moduleId: string;
  roomId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  class?: ClassRecord;
  module?: ModuleRecord;
  room?: RoomRecord;
};

export type SessionPayload = {
  classId: string;
  moduleId: string;
  roomId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

export type StaffRecord = ApiEntity & {
  fullName: string;
  email: string;
  role: StaffRole;
  name?: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
};

export type StaffPayload = {
  fullName: string;
  email: string;
  password?: string;
  role: StaffRole;
};

export type StaffUpdatePayload = {
  fullName: string;
  email: string;
  password?: string;
  role: StaffRole;
};

export type StudentRecord = ApiEntity & {
  fullName: string;
  email: string;
  studentCode: string;
  classId: string;
  class?: ClassRecord;
  attendanceCount?: number;
  attendanceSummary?: {
    present?: number;
    absent?: number;
    late?: number;
    excused?: number;
  };
  attendanceHistory?: AttendanceRecord[];
  createdDate?: string;
  name?: string;
  password?: string;
};

export type StudentPayload = {
  fullName: string;
  email: string;
  password: string;
  studentCode: string;
  classId: string;
};

export type StudentUpdatePayload = {
  fullName: string;
  email: string;
  password?: string;
  studentCode: string;
  classId: string;
};

export type AttendanceRecord = ApiEntity & {
  studentId: string;
  date: string;
  status: string;
  student?: StudentRecord;
};

export type AttendancePayload = {
  studentId: string;
  date: string;
  status: string;
};

export type ListResponse<T> = T[] | { data?: T[]; items?: T[]; results?: T[] };
