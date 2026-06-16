import * as yup from "yup";
import { DAY_OF_WEEK_VALUES } from "@/lib/api/types";

export const sessionFormSchema = yup
  .object({
    classId: yup.string().required("Class is required"),
    moduleId: yup.string().required("Module is required"),
    roomId: yup.string().required("Room is required"),
    dayOfWeek: yup
      .mixed<(typeof DAY_OF_WEEK_VALUES)[number]>()
      .oneOf([...DAY_OF_WEEK_VALUES], "Day is required")
      .required("Day is required"),
    startTime: yup
      .string()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time format")
      .required("Start time is required"),
    endTime: yup
      .string()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time format")
      .test("after-start", "End time must be later than start time", function (value) {
        const { startTime } = this.parent as { startTime?: string };

        if (!startTime || !value) {
          return true;
        }

        return value > startTime;
      })
      .required("End time is required"),
  })
  .required();
