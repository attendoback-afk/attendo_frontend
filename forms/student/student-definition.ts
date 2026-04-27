import type { EntityFormDefinition } from "@/types/form-builder";
import type { StudentPayload } from "@/types/entity-form-values";
import { studentFormSchema } from "@/validators/student-form-schema";

export const studentFormDefinition: EntityFormDefinition<typeof studentFormSchema, StudentPayload> = {
  entityName: "Student",
  submitLabel: "Create Student",
  schema: studentFormSchema,
  defaultValues: {
    fullName: "",
    email: "",
    password: "",
    studentCode: "",
    active: true,
  },
  fields: [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter full name", section: "Student Information" },
    { name: "email", label: "Email", type: "email", placeholder: "student@attendo.edu", section: "Student Information" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a secure password", section: "Security" },
    { name: "studentCode", label: "Student Code", type: "text", placeholder: "e.g. STD-2026-001", section: "Student Information" },
    {
      name: "active",
      label: "Active Account",
      type: "checkbox",
      description: "Controls whether the student account should start as active.",
      section: "Security",
      colSpan: 2,
    },
  ],
  formatPayload: (values) => ({
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    studentCode: values.studentCode.trim(),
    active: values.active,
  }),
};
