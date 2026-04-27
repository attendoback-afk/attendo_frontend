"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { sessionFormDefinition } from "@/forms/session/session-definition";

export function SessionForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={sessionFormDefinition.fields}
      validationSchema={sessionFormDefinition.schema}
      defaultValues={sessionFormDefinition.defaultValues}
      submitLabel={sessionFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = sessionFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
