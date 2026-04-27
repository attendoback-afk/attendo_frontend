"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { staffMemberFormDefinition } from "@/forms/staff-member/staff-member-definition";

export function StaffMemberForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={staffMemberFormDefinition.fields}
      validationSchema={staffMemberFormDefinition.schema}
      defaultValues={staffMemberFormDefinition.defaultValues}
      submitLabel={staffMemberFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = staffMemberFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
