"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { roomFormDefinition } from "@/forms/room/room-definition";

export function RoomForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={roomFormDefinition.fields}
      validationSchema={roomFormDefinition.schema}
      defaultValues={roomFormDefinition.defaultValues}
      submitLabel={roomFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = roomFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
