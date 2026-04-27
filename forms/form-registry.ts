import { AttendanceForm } from "@/forms/attendance/attendance-form";
import { AdminForm } from "@/forms/admin/admin-form";
import { ClassForm } from "@/forms/class/class-form";
import { DepartmentForm } from "@/forms/department/department-form";
import { ModuleForm } from "@/forms/module/module-form";
import { RoleForm } from "@/forms/role/role-form";
import { RoomForm } from "@/forms/room/room-form";
import { SessionForm } from "@/forms/session/session-form";
import { StaffMemberForm } from "@/forms/staff-member/staff-member-form";
import { StudentForm } from "@/forms/student/student-form";

export const formRegistry = [
  { value: "admin", label: "Admin", Component: AdminForm },
  { value: "student", label: "Student", Component: StudentForm },
  { value: "staff-member", label: "StaffMember", Component: StaffMemberForm },
  { value: "role", label: "Role", Component: RoleForm },
  { value: "department", label: "Department", Component: DepartmentForm },
  { value: "class", label: "Class", Component: ClassForm },
  { value: "module", label: "Module", Component: ModuleForm },
  { value: "room", label: "Room", Component: RoomForm },
  { value: "session", label: "Session", Component: SessionForm },
  { value: "attendance", label: "Attendance", Component: AttendanceForm },
] as const;
