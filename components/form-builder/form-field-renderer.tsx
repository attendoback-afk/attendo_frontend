"use client";

import { memo, useId } from "react";
import { Controller, get, useFormContext, useFormState } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { emptyFieldOptions, getReferenceOptions } from "@/recoil/reference-data";
import type { FieldConfig } from "@/types/form-builder";

function FormFieldRendererComponent({
  field,
  disabled,
}: {
  field: FieldConfig;
  disabled: boolean;
}) {
  const inputId = useId();
  const { control, register } = useFormContext();
  const { errors } = useFormState({ control, name: field.name });
  const error = get(errors, field.name);
  const options = field.options ?? (field.optionsKey ? getReferenceOptions(field.optionsKey) : emptyFieldOptions);

  if (field.type === "checkbox") {
    return (
      <Controller
        control={control}
        name={field.name}
        render={({ field: controllerField }) => (
          <div
            className={cn(
              "flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3",
              field.colSpan === 2 && "md:col-span-2",
              field.colSpan === 3 && "xl:col-span-3",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor={inputId} className="dashboard-field-label">
                {field.label}
              </Label>
              {field.description ? (
                <p className="text-sm leading-5 text-muted-foreground">{field.description}</p>
              ) : null}
              {error?.message ? (
                <p className="text-sm text-destructive">{String(error.message)}</p>
              ) : null}
            </div>
            <Checkbox
              id={inputId}
              checked={Boolean(controllerField.value)}
              onCheckedChange={(checked) => controllerField.onChange(Boolean(checked))}
              disabled={disabled}
            />
          </div>
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2",
        field.colSpan === 2 && "md:col-span-2",
        field.colSpan === 3 && "xl:col-span-3",
      )}
    >
      <Label htmlFor={inputId} className="dashboard-field-label">
        {field.label}
      </Label>

      {field.type === "select" ? (
        <Controller
          control={control}
          name={field.name}
          render={({ field: controllerField }) => (
            <Select
              disabled={disabled}
              onValueChange={controllerField.onChange}
              value={controllerField.value ?? ""}
            >
              <SelectTrigger
                className="rounded-lg"
                aria-invalid={Boolean(error)}
              >
                <SelectValue placeholder={field.placeholder ?? `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={`${field.name}-${option.value}`} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : field.type === "textarea" ? (
        <Textarea
          id={inputId}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="min-h-[108px] rounded-lg"
          {...register(field.name)}
        />
      ) : (
        <Input
          id={inputId}
          type={field.type}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="rounded-lg"
          min={field.min}
          max={field.max}
          step={field.step}
          {...register(field.name, field.type === "number" ? { valueAsNumber: true } : undefined)}
        />
      )}

      {field.description ? (
        <p className="text-sm leading-5 text-muted-foreground">{field.description}</p>
      ) : null}
      {error?.message ? (
        <p className="text-sm text-destructive">{String(error.message)}</p>
      ) : null}
    </div>
  );
}

export const FormFieldRenderer = memo(FormFieldRendererComponent);
