import * as yup from "yup";

export const classFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Class name must be at least 2 characters")
      .max(80, "Class name must be 80 characters or less")
      .required("Class name is required"),
    classCode: yup
      .string()
      .trim()
      .uppercase()
      .matches(/^[A-Z0-9-]+$/, "Use only uppercase letters, numbers, or hyphens")
      .required("Class code is required"),
    year: yup.string().required("Year is required"),
    departmentId: yup.string().required("Department is required"),
    description: yup
      .string()
      .trim()
      .max(240, "Description must be 240 characters or less")
      .default(""),
  })
  .required();
