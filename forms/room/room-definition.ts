import type { EntityFormDefinition } from "@/types/form-builder";
import type { RoomPayload } from "@/lib/api/types";
import { roomFormSchema } from "@/validators/room-form-schema";

export const roomFormDefinition: EntityFormDefinition<typeof roomFormSchema, RoomPayload> = {
  entityName: "Room",
  submitLabel: "Create Room",
  schema: roomFormSchema,
  defaultValues: {
    name: "",
  },
  fields: [
    { name: "name", label: "Room Name", type: "text", placeholder: "e.g. Room 101", section: "Room Details" },
  ],
  formatPayload: (values) => ({
    name: values.name.trim(),
  }),
};
