import type { EntityFormDefinition } from "@/types/form-builder";
import type { RolePayload } from "@/types/entity-form-values";
import { roleFormSchema } from "@/validators/role-form-schema";

export const roleFormDefinition: EntityFormDefinition<typeof roleFormSchema, RolePayload> = {
  entityName: "Role",
  submitLabel: "Create Role",
  schema: roleFormSchema,
  defaultValues: {
    name: "",
  },
  fields: [{ name: "name", label: "Role Name", type: "text", placeholder: "Enter role name", section: "Role Details" }],
  formatPayload: (values) => ({
    name: values.name.trim(),
  }),
};
