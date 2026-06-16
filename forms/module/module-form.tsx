"use client";

import { FormBuilder } from "@/components/form-builder/form-builder";
import { moduleFormDefinition } from "@/forms/module/module-definition";
import type { DefaultValues } from "react-hook-form";
import type { InferType } from "yup";

type ModuleFormProps = {
  cancelHref?: string;
  defaultValues?: DefaultValues<InferType<typeof moduleFormDefinition.schema>>;
  submitLabel?: string;
  submittingLabel?: string;
  onSubmit?: (values: InferType<typeof moduleFormDefinition.schema>) => Promise<void> | void;
};

export function ModuleForm({
  cancelHref,
  defaultValues = moduleFormDefinition.defaultValues,
  submitLabel = moduleFormDefinition.submitLabel,
  submittingLabel,
  onSubmit,
}: ModuleFormProps) {
  return (
    <FormBuilder
      fields={moduleFormDefinition.fields}
      validationSchema={moduleFormDefinition.schema}
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
