import type { EntityFormDefinition } from "@/types/form-builder";
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_VALUES, type SessionPayload } from "@/lib/api/types";
import { sessionFormSchema } from "@/validators/session-form-schema";

const dayOfWeekOptions = DAY_OF_WEEK_VALUES.map((value) => ({
  label: DAY_OF_WEEK_LABELS[value],
  value,
}));

export const sessionFormDefinition: EntityFormDefinition<typeof sessionFormSchema, SessionPayload> = {
  entityName: "Session",
  submitLabel: "Create Session",
  schema: sessionFormSchema,
  defaultValues: {
    classId: "",
    moduleId: "",
    roomId: "",
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
  },
  fields: [
    { name: "classId", label: "Class", type: "select", optionsKey: "classes", placeholder: "Select class", section: "Session Details" },
    { name: "moduleId", label: "Module", type: "select", optionsKey: "modules", placeholder: "Select module", section: "Session Details" },
    { name: "roomId", label: "Room", type: "select", optionsKey: "rooms", placeholder: "Select room", section: "Session Details" },
    { name: "dayOfWeek", label: "Day of Week", type: "select", options: dayOfWeekOptions, placeholder: "Select day", section: "Schedule" },
    { name: "startTime", label: "Start Time", type: "time", section: "Schedule" },
    { name: "endTime", label: "End Time", type: "time", section: "Schedule" },
  ],
  formatPayload: (values) => ({
    classId: values.classId.trim(),
    moduleId: values.moduleId.trim(),
    roomId: values.roomId.trim(),
    dayOfWeek: Number(values.dayOfWeek) as (typeof DAY_OF_WEEK_VALUES)[number],
    startTime: values.startTime,
    endTime: values.endTime,
  }),
};
