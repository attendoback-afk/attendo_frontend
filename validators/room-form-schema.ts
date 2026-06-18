import * as yup from "yup";

export const roomFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Room name must be at least 2 characters")
      .max(100, "Room name must be 100 characters or less")
      .required("Room name is required"),
  })
  .required();
