"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import type { AnyObjectSchema, InferType } from "yup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormFieldRenderer } from "@/components/form-builder/form-field-renderer";
import type { FieldConfig } from "@/types/form-builder";

type FormBuilderProps<TSchema extends AnyObjectSchema> = {
  fields: FieldConfig<InferType<TSchema>>[];
  validationSchema: TSchema;
  defaultValues: DefaultValues<InferType<TSchema>>;
  onSubmit: (values: InferType<TSchema>) => Promise<void> | void;
  onSubmitSuccess?: (
    values: InferType<TSchema>,
    methods: UseFormReturn<InferType<TSchema>>,
  ) => Promise<void> | void;
  submitLabel: string;
  submittingLabel?: string;
  cancelHref?: string;
};

type GroupedSection = {
  section: string;
  fields: FieldConfig[];
};

export function FormBuilder<TSchema extends AnyObjectSchema>({
  fields,
  validationSchema,
  defaultValues,
  onSubmit,
  onSubmitSuccess,
  submitLabel,
  submittingLabel = "Preparing...",
  cancelHref,
}: FormBuilderProps<TSchema>) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<InferType<TSchema>>({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const groupedSections = useMemo<GroupedSection[]>(() => {
    const ordered = new Map<string, FieldConfig[]>();

    fields.forEach((field) => {
      const existing = ordered.get(field.section) ?? [];
      ordered.set(field.section, [...existing, field as FieldConfig<FieldValues>]);
    });

    return Array.from(ordered.entries()).map(([section, sectionFields]) => ({
      section,
      fields: sectionFields,
    }));
  }, [fields]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
      await onSubmitSuccess?.(values, methods);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong while preparing the payload.",
      );
    }
  });

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit} className="dashboard-page" noValidate>
        {submitError ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertTitle>Unable to prepare payload</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        {groupedSections.map((section) => (
          <Card key={section.section} className="dashboard-panel gap-0 py-0">
            <CardContent className="p-6">
              <h2 className="dashboard-section-title">{section.section}</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.fields.map((field) => (
                  <FormFieldRenderer
                    key={String(field.name)}
                    field={field}
                    disabled={methods.formState.isSubmitting}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          {cancelHref ? (
            <Link href={cancelHref}>
              <Button variant="outline" className="min-w-[96px] rounded-lg" type="button">
                Cancel
              </Button>
            </Link>
          ) : null}
          <Button
            className="min-w-[140px] rounded-lg"
            type="submit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
