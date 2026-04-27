import * as yup from "yup";

export const attendanceFormSchema = yup
  .object({
    studentId: yup.string().required("Student is required"),
    sessionId: yup.string().required("Session is required"),
    markedBy: yup.string().required("Staff member is required"),
    date: yup.string().required("Date is required"),
    status: yup.string().required("Status is required"),
  })
  .required();
