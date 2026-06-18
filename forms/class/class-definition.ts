import type { EntityFormDefinition } from "@/types/form-builder";
import type { ClassPayload } from "@/lib/api/types";
import { classFormSchema } from "@/validators/class-form-schema";

const yearOptions = [
  { label: "1st Year", value: "1" },
  { label: "2nd Year", value: "2" },
  { label: "3rd Year", value: "3" },
  { label: "4th Year", value: "4" },
];

export const classFormDefinition: EntityFormDefinition<typeof classFormSchema, ClassPayload> = {
  entityName: "Class",
  submitLabel: "Create Class",
  schema: classFormSchema,
  defaultValues: {
    name: "",
    classCode: "",
    departmentId: "",
    year: "",
    description: "",
  },
  fields: [
    { name: "name", label: "Class Name", type: "text", placeholder: "Enter class name", section: "Class Information" },
    { name: "classCode", label: "Class Code", type: "text", placeholder: "e.g. CS-1A", section: "Class Information" },
    { name: "departmentId", label: "Department", type: "select", options: [], placeholder: "Select department", section: "Class Information" },
    { name: "year", label: "Year", type: "select", options: yearOptions, placeholder: "Select year", section: "Class Information" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Add class notes",
      section: "Class Information",
      colSpan: 3,
    },
  ],
  formatPayload: (values) => ({
    name: values.name.trim(),
    classCode: values.classCode.trim().toUpperCase(),
    departmentId: Number(values.departmentId),
    year: Number(values.year),
    description: values.description?.trim() ?? "",
  }),
};
