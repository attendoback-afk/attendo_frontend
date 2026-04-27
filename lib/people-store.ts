"use client";

export const ADMIN_ROLE_OPTIONS = ["admin", "manager", "teacher"] as const;

export type AdminRole = (typeof ADMIN_ROLE_OPTIONS)[number];

export type BasePersonRecord = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  active: boolean;
  createdAt: Date;
};

export type AdminRecord = BasePersonRecord & {
  role: AdminRole;
};

export type StudentRecord = BasePersonRecord & {
  studentCode: string;
};

export const initialAdmins: AdminRecord[] = [
  {
    id: "admin-1",
    fullName: "Dr. Hesham A. Mohamed",
    email: "hesham@attendo.edu",
    password: "Attendo!2026A",
    active: true,
    role: "teacher",
    createdAt: new Date("2026-04-18T09:00:00"),
  },
  {
    id: "admin-2",
    fullName: "Sara Mohamed",
    email: "sara@attendo.edu",
    password: "Attendo!2026B",
    active: true,
    role: "manager",
    createdAt: new Date("2026-04-19T09:00:00"),
  },
];

export const initialStudents: StudentRecord[] = [
  {
    id: "student-1",
    fullName: "Ali Omar",
    email: "ali@attendo.edu",
    password: "Student!2026A",
    active: true,
    studentCode: "CS2021001",
    createdAt: new Date("2026-04-20T09:00:00"),
  },
  {
    id: "student-2",
    fullName: "Ahmed Mohamed",
    email: "ahmed@attendo.edu",
    password: "Student!2026B",
    active: false,
    studentCode: "CS2021002",
    createdAt: new Date("2026-04-21T09:00:00"),
  },
];
