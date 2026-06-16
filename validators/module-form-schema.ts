import * as yup from "yup";

export const moduleFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Module name must be at least 2 characters")
      .max(80, "Module name must be 80 characters or less")
      .required("Module name is required"),
    code: yup
      .string()
      .trim()
      .uppercase()
      .matches(/^[A-Z0-9-]+$/, "Use only uppercase letters, numbers, or hyphens")
      .required("Module code is required"),
    description: yup
      .string()
      .trim()
      .max(240, "Description must be 240 characters or less")
      .nullable()
      .default(""),
  })
  .required();
