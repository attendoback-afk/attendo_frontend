import type { EntityFormDefinition } from "@/types/form-builder";
import type { ModulePayload } from "@/types/entity-form-values";
import { moduleFormSchema } from "@/validators/module-form-schema";

export const moduleFormDefinition: EntityFormDefinition<typeof moduleFormSchema, ModulePayload> = {
  entityName: "Module",
  submitLabel: "Create Module",
  schema: moduleFormSchema,
  defaultValues: {
    name: "",
    code: "",
    description: "",
  },
  fields: [
    { name: "name", label: "Module Name", type: "text", placeholder: "Enter module name", section: "Module Details" },
    { name: "code", label: "Module Code", type: "text", placeholder: "e.g. CS101", section: "Module Details" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the module",
      section: "Module Details",
      colSpan: 3,
    },
  ],
  formatPayload: (values) => ({
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description.trim() ? values.description.trim() : null,
  }),
};
