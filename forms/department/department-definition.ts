import type { EntityFormDefinition } from "@/types/form-builder";
import type { DepartmentPayload } from "@/lib/api/types";
import { departmentFormSchema } from "@/validators/department-form-schema";

export const departmentFormDefinition: EntityFormDefinition<
  typeof departmentFormSchema,
  DepartmentPayload
> = {
  entityName: "Department",
  submitLabel: "Create Department",
  schema: departmentFormSchema,
  defaultValues: {
    name: "",
    description: "",
  },
  fields: [
    { name: "name", label: "Department Name", type: "text", placeholder: "Enter department name", section: "Department Details" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the department",
      section: "Department Details",
      colSpan: 3,
    },
  ],
  formatPayload: (values) => ({
    name: values.name.trim(),
    description: values.description.trim(),
  }),
};
