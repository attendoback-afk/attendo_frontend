"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { userFormDefinition } from "@/forms/user/user-definition";

export function UserForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={userFormDefinition.fields}
      validationSchema={userFormDefinition.schema}
      defaultValues={userFormDefinition.defaultValues}
      submitLabel={userFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = userFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
