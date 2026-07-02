"use client";

import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import type { InferType } from "yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentFormSchema } from "@/validators/student-form-schema";
import type { ClassRecord, StudentRecord } from "@/lib/api/types";

export type StudentFormValues = InferType<typeof studentFormSchema>;

const defaultValues: StudentFormValues = {
  fullName: "",
  email: "",
  password: "",
  studentCode: "",
  classId: "",
};

function normalizeSelectValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const candidate = value as { toString?: () => string };
    if (typeof candidate.toString === "function") {
      const stringValue = candidate.toString();
      return stringValue === "[object Object]" ? "" : stringValue;
    }
  }

  return "";
}

export function StudentForm({
  cancelHref,
  defaultValue,
  classOptions,
  submitLabel = "Create Student",
  passwordOptional = false,
  onSubmit,
}: {
  cancelHref?: string;
  defaultValue?: Partial<StudentFormValues> | StudentRecord | null;
  classOptions: ClassRecord[];
  submitLabel?: string;
  passwordOptional?: boolean;
  onSubmit: (values: StudentFormValues) => Promise<void> | void;
}) {
  const schema = passwordOptional
    ? studentFormSchema.shape({
        password: yup.string().trim().notRequired(),
      })
    : studentFormSchema;

  const methods = useForm<StudentFormValues>({
    resolver: yupResolver(schema as yup.ObjectSchema<StudentFormValues>),
    defaultValues: {
      ...defaultValues,
      fullName: (defaultValue as StudentRecord | null | undefined)?.user?.fullName ?? "",
      email: (defaultValue as StudentRecord | null | undefined)?.user?.email ?? "",
      password: "",
      studentCode: (defaultValue as StudentRecord | null | undefined)?.studentCode ?? "",
      classId: normalizeSelectValue(
        (defaultValue as StudentRecord | null | undefined)?.classId ?? "",
      ),
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleSubmit = methods.handleSubmit(async (values: StudentFormValues) => {
    await onSubmit(values);
  });

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit} className="dashboard-page" noValidate>
        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="student-full-name"
                  className="dashboard-field-label"
                >
                  Full Name
                </Label>
                <Input
                  id="student-full-name"
                  {...methods.register("fullName")}
                />
                {methods.formState.errors.fullName?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="student-email"
                  className="dashboard-field-label"
                >
                  Email
                </Label>
                <Input
                  id="student-email"
                  type="email"
                  {...methods.register("email")}
                />
                {methods.formState.errors.email?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="student-code" className="dashboard-field-label">
                  Student Code
                </Label>
                <Input id="student-code" {...methods.register("studentCode")} />
                {methods.formState.errors.studentCode?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.studentCode.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="student-class"
                  className="dashboard-field-label"
                >
                  Class
                </Label>
                <Controller
                  control={methods.control}
                  name="classId"
                  render={({ field }) => {
                    const normalizedValue = normalizeSelectValue(field.value);
                    const selectedClass = classOptions.find(
                      (classRecord) =>
                        normalizeSelectValue(classRecord.id) === normalizedValue,
                    );

                    return (
                      <Select
                        value={selectedClass ? normalizedValue : ""}
                        onValueChange={(nextValue) => field.onChange(nextValue)}
                      >
                        <SelectTrigger id="name">
                          <SelectValue placeholder="Select class">
                            {selectedClass ? selectedClass.name : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((classRecord) => {
                            const optionValue = normalizeSelectValue(classRecord.id);

                            return (
                              <SelectItem
                                key={optionValue || classRecord.name}
                                value={optionValue}
                              >
                                {classRecord.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {methods.formState.errors.classId?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.classId.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label
                  htmlFor="student-password"
                  className="dashboard-field-label"
                >
                  Password {passwordOptional ? "(optional)" : ""}
                </Label>
                <Input
                  id="student-password"
                  type="password"
                  {...methods.register("password")}
                />
                {methods.formState.errors.password?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          {cancelHref ? (
            <Button
              asChild
              variant="outline"
              className="rounded-xl"
              type="button"
            >
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          ) : null}
          <Button
            className="rounded-xl"
            type="submit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
