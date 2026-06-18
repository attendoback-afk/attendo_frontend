"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { departmentFormDefinition } from "@/forms/department/department-definition";
import type { DefaultValues } from "react-hook-form";
import type { InferType } from "yup";

type DepartmentFormValues = InferType<typeof departmentFormDefinition.schema>;

type DepartmentFormProps = {
  cancelHref?: string;
  defaultValues?: DefaultValues<DepartmentFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit?: (values: DepartmentFormValues) => Promise<void> | void;
};

export function DepartmentForm({
  cancelHref,
  defaultValues = departmentFormDefinition.defaultValues,
  submitLabel = departmentFormDefinition.submitLabel,
  submittingLabel,
  onSubmit,
}: DepartmentFormProps) {
  return (
    <FormBuilder
      fields={departmentFormDefinition.fields}
      validationSchema={departmentFormDefinition.schema}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      cancelHref={cancelHref}
      onSubmit={async (data) => {
        await onSubmit?.(data);
      }}
    />
  );
}
