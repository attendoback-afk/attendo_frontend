import type { EntityFormDefinition } from "@/types/form-builder";
import type { AttendancePayload } from "@/types/entity-form-values";
import { attendanceFormSchema } from "@/validators/attendance-form-schema";

const attendanceStatusOptions = [
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
  { label: "Late", value: "late" },
  { label: "Excused", value: "excused" },
];

export const attendanceFormDefinition: EntityFormDefinition<
  typeof attendanceFormSchema,
  AttendancePayload
> = {
  entityName: "Attendance",
  submitLabel: "Create Attendance",
  schema: attendanceFormSchema,
  defaultValues: {
    studentId: "",
    sessionId: "",
    markedBy: "",
    date: "",
    status: "",
  },
  fields: [
    { name: "studentId", label: "Student", type: "select", optionsKey: "students", placeholder: "Select student", section: "Attendance Details" },
    { name: "sessionId", label: "Session", type: "select", optionsKey: "sessions", placeholder: "Select session", section: "Attendance Details" },
    { name: "markedBy", label: "Marked By", type: "select", optionsKey: "staffMembers", placeholder: "Select staff member", section: "Attendance Details" },
    { name: "date", label: "Date", type: "date", section: "Attendance Details" },
    { name: "status", label: "Status", type: "select", options: attendanceStatusOptions, placeholder: "Select status", section: "Attendance Details" },
  ],
  formatPayload: (values) => ({
    studentId: Number(values.studentId),
    sessionId: Number(values.sessionId),
    markedBy: Number(values.markedBy),
    date: new Date(`${values.date}T00:00:00`).toISOString(),
    status: values.status,
  }),
};
