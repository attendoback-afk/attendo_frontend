import type { DefaultValues, FieldPath, FieldValues } from "react-hook-form";
import type { AnyObjectSchema, InferType } from "yup";

export type FieldOption = {
  label: string;
  value: string | number;
};

export type ReferenceOptionsKey =
  | "classes"
  | "departments"
  | "modules"
  | "roles"
  | "rooms"
  | "sessions"
  | "staffMembers"
  | "students"
  | "users";

export type FieldConfig<TValues extends FieldValues = FieldValues> = {
  name: FieldPath<TValues>;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "date"
    | "time"
    | "textarea"
    | "checkbox";
  placeholder?: string;
  description?: string;
  options?: FieldOption[];
  optionsKey?: ReferenceOptionsKey;
  section: string;
  colSpan?: 1 | 2 | 3;
  min?: number;
  max?: number;
  step?: number | string;
};

export type EntityFormDefinition<
  TSchema extends AnyObjectSchema,
  TPayload,
> = {
  entityName: string;
  submitLabel: string;
  schema: TSchema;
  defaultValues: DefaultValues<InferType<TSchema>>;
  fields: FieldConfig<InferType<TSchema>>[];
  formatPayload: (values: InferType<TSchema>) => TPayload;
};
