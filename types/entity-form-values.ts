import type { InferType } from "yup";
import { adminFormSchema } from "@/validators/admin-form-schema";
import { attendanceFormSchema } from "@/validators/attendance-form-schema";
import { classFormSchema } from "@/validators/class-form-schema";
import { departmentFormSchema } from "@/validators/department-form-schema";
import { moduleFormSchema } from "@/validators/module-form-schema";
import { roleFormSchema } from "@/validators/role-form-schema";
import { roomFormSchema } from "@/validators/room-form-schema";
import { sessionFormSchema } from "@/validators/session-form-schema";
import { staffMemberFormSchema } from "@/validators/staff-member-form-schema";
import { studentFormSchema } from "@/validators/student-form-schema";
import { userFormSchema } from "@/validators/user-form-schema";

export type AdminFormValues = InferType<typeof adminFormSchema>;
export type AdminPayload = {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "teacher";
  active: boolean;
};

export type UserFormValues = InferType<typeof userFormSchema>;
export type UserPayload = {
  fullName: string;
  email: string;
  password: string;
  isValid: boolean;
};

export type StudentFormValues = InferType<typeof studentFormSchema>;
export type StudentPayload = {
  fullName: string;
  email: string;
  password: string;
  studentCode: string;
  active: boolean;
};

export type StaffMemberFormValues = InferType<typeof staffMemberFormSchema>;
export type StaffMemberPayload = {
  userId: number;
  roleId: number;
};

export type RoleFormValues = InferType<typeof roleFormSchema>;
export type RolePayload = {
  name: string;
};

export type DepartmentFormValues = InferType<typeof departmentFormSchema>;
export type DepartmentPayload = {
  name: string;
  description: string;
};

export type ClassFormValues = InferType<typeof classFormSchema>;
export type ClassPayload = {
  name: string;
  classCode: string;
  year: number;
  departmentId: number;
  description: string | null;
};

export type ModuleFormValues = InferType<typeof moduleFormSchema>;
export type ModulePayload = {
  name: string;
  code: string;
  description: string | null;
};

export type RoomFormValues = InferType<typeof roomFormSchema>;
export type RoomPayload = {
  name: string;
};

export type SessionFormValues = InferType<typeof sessionFormSchema>;
export type SessionPayload = {
  classId: number;
  moduleId: number;
  roomId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type AttendanceFormValues = InferType<typeof attendanceFormSchema>;
export type AttendancePayload = {
  studentId: number;
  sessionId: number;
  markedBy: number;
  date: string;
  status: string;
};
