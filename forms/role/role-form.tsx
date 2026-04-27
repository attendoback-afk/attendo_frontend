"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { roleFormDefinition } from "@/forms/role/role-definition";

export function RoleForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={roleFormDefinition.fields}
      validationSchema={roleFormDefinition.schema}
      defaultValues={roleFormDefinition.defaultValues}
      submitLabel={roleFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = roleFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
