import * as yup from "yup";
import { ADMIN_ROLE_OPTIONS } from "@/lib/people-store";

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
      .mixed<(typeof ADMIN_ROLE_OPTIONS)[number]>()
      .oneOf([...ADMIN_ROLE_OPTIONS], "Select a valid role")
      .required("Role is required"),
    active: yup.boolean().required(),
  })
  .required();
