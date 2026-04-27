import type { FieldOption, ReferenceOptionsKey } from "@/types/form-builder";

type ReferenceUser = {
  id: number;
  fullName: string;
  email: string;
  isValid: boolean;
};

type ReferenceClass = {
  id: number;
  name: string;
  classCode: string;
  year: number;
  departmentName: string;
};

type ReferenceModule = {
  id: number;
  name: string;
  code: string;
};

type ReferenceRole = {
  id: number;
  name: string;
};

type ReferenceDepartment = {
  id: number;
  name: string;
};

type ReferenceRoom = {
  id: number;
  name: string;
};

type ReferenceStudent = {
  id: number;
  fullName: string;
  studentCode: string;
};

type ReferenceStaffMember = {
  id: number;
  fullName: string;
  roleName: string;
};

type ReferenceSession = {
  id: number;
  className: string;
  moduleName: string;
  dayOfWeek: string;
  timeRange: string;
};

const userList: ReferenceUser[] = [
  { id: 1, fullName: "Ahmed Hassan", email: "ahmed@attendo.edu", isValid: true },
  { id: 2, fullName: "Mona Ali", email: "mona@attendo.edu", isValid: true },
  { id: 3, fullName: "Youssef Adel", email: "youssef@attendo.edu", isValid: false },
];

const classList: ReferenceClass[] = [
  { id: 1, name: "Information Technology A", classCode: "ITA-1", year: 1, departmentName: "IT" },
  { id: 2, name: "Information Technology B", classCode: "ITB-2", year: 2, departmentName: "IT" },
  { id: 3, name: "Networks A", classCode: "NET-3", year: 3, departmentName: "Computer Networks" },
  { id: 4, name: "Embedded Systems A", classCode: "EMB-4", year: 4, departmentName: "Computer Engineering" },
];

const moduleList: ReferenceModule[] = [
  { id: 1, name: "Computer Systems", code: "CS101" },
  { id: 2, name: "Database Systems", code: "DB204" },
  { id: 3, name: "Network Engineering", code: "NET310" },
  { id: 4, name: "Embedded Systems", code: "EMB402" },
];

const roleList: ReferenceRole[] = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "Doctor" },
  { id: 4, name: "Teaching Assistant" },
];

const departmentList: ReferenceDepartment[] = [
  { id: 1, name: "Information Technology" },
  { id: 2, name: "Electrical Technology" },
  { id: 3, name: "Mechanical Technology" },
];

const roomList: ReferenceRoom[] = [
  { id: 1, name: "Room 101" },
  { id: 2, name: "Lab 4" },
  { id: 3, name: "Hall B" },
  { id: 4, name: "Embedded Lab" },
];

const studentList: ReferenceStudent[] = [
  { id: 1, fullName: "Michele Johnson", studentCode: "STD-1001" },
  { id: 2, fullName: "Richi Akon", studentCode: "STD-1002" },
  { id: 3, fullName: "Amanda Kherr", studentCode: "STD-1003" },
];

const staffMemberList: ReferenceStaffMember[] = [
  { id: 1, fullName: "Dr. Hesham Mohamed", roleName: "Doctor" },
  { id: 2, fullName: "Ahmed Abdelsamie", roleName: "Admin" },
  { id: 3, fullName: "Yousra Salah", roleName: "Teaching Assistant" },
];

const sessionList: ReferenceSession[] = [
  { id: 1, className: "ITA-1", moduleName: "Computer Systems", dayOfWeek: "Monday", timeRange: "08:00 - 09:30" },
  { id: 2, className: "ITB-2", moduleName: "Database Systems", dayOfWeek: "Tuesday", timeRange: "09:45 - 11:15" },
  { id: 3, className: "NET-3", moduleName: "Network Engineering", dayOfWeek: "Wednesday", timeRange: "11:30 - 13:00" },
];

export const emptyFieldOptions: FieldOption[] = [];

export function getReferenceOptions(key: ReferenceOptionsKey): FieldOption[] {
  switch (key) {
    case "users":
      return userList.map((item) => ({
        value: item.id,
        label: `${item.fullName} (${item.email})`,
      }));
    case "classes":
      return classList.map((item) => ({
        value: item.id,
        label: `${item.classCode} - ${item.name} / Year ${item.year}`,
      }));
    case "modules":
      return moduleList.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.name}`,
      }));
    case "roles":
      return roleList.map((item) => ({
        value: item.id,
        label: item.name,
      }));
    case "departments":
      return departmentList.map((item) => ({
        value: item.id,
        label: item.name,
      }));
    case "rooms":
      return roomList.map((item) => ({
        value: item.id,
        label: item.name,
      }));
    case "students":
      return studentList.map((item) => ({
        value: item.id,
        label: `${item.fullName} (${item.studentCode})`,
      }));
    case "staffMembers":
      return staffMemberList.map((item) => ({
        value: item.id,
        label: `${item.fullName} - ${item.roleName}`,
      }));
    case "sessions":
      return sessionList.map((item) => ({
        value: item.id,
        label: `${item.className} / ${item.moduleName} / ${item.dayOfWeek} / ${item.timeRange}`,
      }));
    default:
      return emptyFieldOptions;
  }
}
