import type { EntityFormDefinition } from "@/types/form-builder";
import type { SessionPayload } from "@/types/entity-form-values";
import { sessionFormSchema } from "@/validators/session-form-schema";

const dayOfWeekOptions = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

export const sessionFormDefinition: EntityFormDefinition<typeof sessionFormSchema, SessionPayload> = {
  entityName: "Session",
  submitLabel: "Create Session",
  schema: sessionFormSchema,
  defaultValues: {
    classId: "",
    moduleId: "",
    roomId: "",
    dayOfWeek: "",
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
    classId: Number(values.classId),
    moduleId: Number(values.moduleId),
    roomId: Number(values.roomId),
    dayOfWeek: Number(values.dayOfWeek),
    startTime: values.startTime,
    endTime: values.endTime,
  }),
};
