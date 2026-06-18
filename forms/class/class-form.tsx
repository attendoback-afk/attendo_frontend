"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { classFormDefinition } from "@/forms/class/class-definition";
import type { FieldOption } from "@/types/form-builder";
import type { DefaultValues } from "react-hook-form";
import type { InferType } from "yup";

type ClassFormValues = InferType<typeof classFormDefinition.schema>;

type ClassFormProps = {
  cancelHref?: string;
  defaultValues?: DefaultValues<ClassFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit?: (values: ClassFormValues) => Promise<void> | void;
  departmentOptions?: FieldOption[];
};

export function ClassForm({
  cancelHref,
  defaultValues = classFormDefinition.defaultValues,
  submitLabel = classFormDefinition.submitLabel,
  submittingLabel,
  onSubmit,
  departmentOptions = [],
}: ClassFormProps) {
  const fields = classFormDefinition.fields.map((field) =>
    field.name === "departmentId" ? { ...field, options: departmentOptions } : field,
  );

  return (
    <FormBuilder
      fields={fields}
      validationSchema={classFormDefinition.schema}
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
