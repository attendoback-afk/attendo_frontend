export type ApiEntity = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export const AUTH_ROLES = ["MANAGER", "PROFESSOR", "ASSISTANT"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const DAY_OF_WEEK_VALUES = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];

export type CurrentUser = ApiEntity & {
  name: string;
  email: string;
  role: AuthRole;
  staff: {
    role: {
      name: AuthRole;
    };
  };
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: CurrentUser;
};

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

export type ListResponse<T> = T[] | { data?: T[]; items?: T[]; results?: T[] };
