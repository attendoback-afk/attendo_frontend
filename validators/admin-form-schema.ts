import * as yup from "yup";
import { STAFF_ROLE_VALUES } from "@/lib/api/types";

export const adminFormSchema = yup
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
    role: yup
      .mixed<(typeof STAFF_ROLE_VALUES)[number]>()
      .oneOf([...STAFF_ROLE_VALUES], "Select a valid role")
      .required("Role is required"),
  })
  .required();
