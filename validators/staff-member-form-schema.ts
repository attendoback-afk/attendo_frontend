import * as yup from "yup";

export const staffMemberFormSchema = yup
  .object({
    userId: yup.string().required("User is required"),
    roleId: yup.string().required("Role is required"),
  })
  .required();
