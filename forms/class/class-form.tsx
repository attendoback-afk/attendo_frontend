"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { classFormDefinition } from "@/forms/class/class-definition";

export function ClassForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={classFormDefinition.fields}
      validationSchema={classFormDefinition.schema}
      defaultValues={classFormDefinition.defaultValues}
      submitLabel={classFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = classFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
