import * as yup from "yup";

export const departmentFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(3, "Department name must be at least 3 characters")
      .max(80, "Department name must be 80 characters or less")
      .required("Department name is required"),
    description: yup
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(240, "Description must be 240 characters or less")
      .required("Description is required"),
  })
  .required();
