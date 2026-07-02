import type {
  ClassRecord,
  ModuleRecord,
  SessionRecord,
  StudentRecord,
} from "@/lib/api/types";

export const MANUAL_ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;

export type ManualAttendanceStatus = (typeof MANUAL_ATTENDANCE_STATUSES)[number];

export type ManualAttendanceFilters = {
  sessionId: string;
  classId: string;
  date: string;
  status: ManualAttendanceStatus | "all";
};

export type ManualAttendanceRecord = {
  id: string | number;
  studentId: string | number;
  sessionId?: string | number;
  date?: string;
  status: ManualAttendanceStatus | string;
  student?: StudentRecord & {
    avatarUrl?: string | null;
    imageUrl?: string | null;
    user?: {
      fullName?: string;
      name?: string;
      email?: string;
    };
  };
  session?: SessionRecord;
};

export type ManualAttendanceListParams = {
  sessionId: string;
  classId: string;
  date: string;
  status?: ManualAttendanceStatus;
};

export type MarkManualAttendancePayload = {
  studentId: string | number;
  sessionId: string | number;
  status: ManualAttendanceStatus;
  date?: string;
};

export type BulkManualAttendancePayload = {
  sessionId: string | number;
  date?: string;
  attendance: Array<{
    studentId: string | number;
    status: ManualAttendanceStatus;
  }>;
};

export type ManualAttendanceReportParams = {
  classId: string;
  moduleId: string;
  from: string;
  to: string;
};

export type ManualAttendanceReportSummary = {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
};

export type ManualAttendanceReport = ManualAttendanceReportSummary & {
  class?: ClassRecord;
  module?: ModuleRecord;
  records: ManualAttendanceRecord[];
};
