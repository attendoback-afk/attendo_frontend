"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { attendanceFormDefinition } from "@/forms/attendance/attendance-definition";

export function AttendanceForm({ cancelHref }: { cancelHref?: string }) {
  return (
    <FormBuilder
      fields={attendanceFormDefinition.fields}
      validationSchema={attendanceFormDefinition.schema}
      defaultValues={attendanceFormDefinition.defaultValues}
      submitLabel={attendanceFormDefinition.submitLabel}
      cancelHref={cancelHref}
      onSubmit={(data) => {
        const payload = attendanceFormDefinition.formatPayload(data);
        console.log("READY PAYLOAD:", payload);
      }}
    />
  );
}
