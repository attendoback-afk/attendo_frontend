"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { moduleFormDefinition } from "@/forms/module/module-definition";

export function ModuleForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={moduleFormDefinition.fields}
      validationSchema={moduleFormDefinition.schema}
      defaultValues={moduleFormDefinition.defaultValues}
      submitLabel={moduleFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = moduleFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
