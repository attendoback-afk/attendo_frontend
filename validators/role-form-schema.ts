import * as yup from "yup";

export const roleFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Role name must be at least 2 characters")
      .max(40, "Role name must be 40 characters or less")
      .required("Role name is required"),
  })
  .required();
