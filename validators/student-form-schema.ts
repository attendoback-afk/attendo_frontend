import * as yup from "yup";

export const studentFormSchema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(80, "Full name must be 80 characters or less")
      .required("Full name is required"),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: yup
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must include an uppercase letter")
      .matches(/[a-z]/, "Password must include a lowercase letter")
      .matches(/[0-9]/, "Password must include a number")
      .matches(/[^A-Za-z0-9]/, "Password must include a symbol")
      .required("Password is required"),
    studentCode: yup
      .string()
      .trim()
      .min(3, "Student code must be at least 3 characters")
      .max(30, "Student code must be 30 characters or less")
      .required("Student code is required"),
    active: yup.boolean().required(),
  })
  .required();
