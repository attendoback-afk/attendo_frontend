import type { EntityFormDefinition } from "@/types/form-builder";
import type { UserPayload } from "@/types/entity-form-values";
import { userFormSchema } from "@/validators/user-form-schema";

export const userFormDefinition: EntityFormDefinition<typeof userFormSchema, UserPayload> = {
  entityName: "User",
  submitLabel: "Create User",
  schema: userFormSchema,
  defaultValues: {
    fullName: "",
    email: "",
    password: "",
    isValid: true,
  },
  fields: [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter full name", section: "Account Information" },
    { name: "email", label: "Email", type: "email", placeholder: "user@attendo.edu", section: "Account Information" },
    { name: "password", label: "Password", type: "password", placeholder: "Create a secure password", section: "Security" },
    {
      name: "isValid",
      label: "Active Account",
      type: "checkbox",
      description: "Controls whether the backend should create the account as active.",
      section: "Security",
      colSpan: 2,
    },
  ],
  formatPayload: (values) => ({
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    isValid: values.isValid,
  }),
};
