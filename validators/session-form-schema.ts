import * as yup from "yup";

export const sessionFormSchema = yup
  .object({
    classId: yup.string().required("Class is required"),
    moduleId: yup.string().required("Module is required"),
    roomId: yup.string().required("Room is required"),
    dayOfWeek: yup.string().required("Day is required"),
    startTime: yup.string().required("Start time is required"),
    endTime: yup.string().required("End time is required"),
  })
  .required();
