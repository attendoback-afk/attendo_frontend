import type { EntityFormDefinition } from "@/types/form-builder";
import type { StaffMemberPayload } from "@/types/entity-form-values";
import { staffMemberFormSchema } from "@/validators/staff-member-form-schema";

export const staffMemberFormDefinition: EntityFormDefinition<
  typeof staffMemberFormSchema,
  StaffMemberPayload
> = {
  entityName: "StaffMember",
  submitLabel: "Create Staff Member",
  schema: staffMemberFormSchema,
  defaultValues: {
    userId: "",
    roleId: "",
  },
  fields: [
    { name: "userId", label: "User", type: "select", optionsKey: "users", placeholder: "Select user", section: "Staff Assignment" },
    { name: "roleId", label: "Role", type: "select", optionsKey: "roles", placeholder: "Select role", section: "Staff Assignment" },
  ],
  formatPayload: (values) => ({
    userId: Number(values.userId),
    roleId: Number(values.roleId),
  }),
};
