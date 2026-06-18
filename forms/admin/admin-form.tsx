"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import type { InferType } from "yup";
import * as yup from "yup";
import Link from "next/link";
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
import { adminFormSchema } from "@/validators/admin-form-schema";
import { STAFF_ROLE_VALUES, type StaffRecord } from "@/lib/api/types";

export type AdminFormValues = InferType<typeof adminFormSchema>;

const defaultValues: AdminFormValues = {
  fullName: "",
  email: "",
  password: "",
  role: "MANAGER",
};

export function AdminForm({
  cancelHref,
  defaultValue,
  submitLabel = "Create Admin",
  passwordOptional = false,
  onSubmit,
}: {
  cancelHref?: string;
  defaultValue?: Partial<AdminFormValues> | StaffRecord | null;
  submitLabel?: string;
  passwordOptional?: boolean;
  onSubmit: (values: AdminFormValues) => Promise<void> | void;
}) {
  const schema = passwordOptional
    ? adminFormSchema.shape({
        password: yup.string().trim().notRequired(),
      })
    : adminFormSchema;

  const methods = useForm<AdminFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...defaultValues,
      fullName: defaultValue?.user.fullName ?? "",
      email: defaultValue?.user.email ?? "",
      password: "",
      role: defaultValue?.role?.name ?? "MANAGER",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      password: passwordOptional && !values.password ? "" : values.password,
    });
  });

  return (
    <Form {...methods}>
      <form onSubmit={handleSubmit} className="dashboard-page" noValidate>
        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label
                  htmlFor="admin-full-name"
                  className="dashboard-field-label"
                >
                  Full Name
                </Label>
                <Input id="admin-full-name" {...methods.register("fullName")} />
                {methods.formState.errors.fullName?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="admin-email" className="dashboard-field-label">
                  Email
                </Label>
                <Input
                  id="admin-email"
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
                <Label htmlFor="admin-role" className="dashboard-field-label">
                  Role
                </Label>
                <Controller
                  control={methods.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="admin-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLE_VALUES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {methods.formState.errors.role?.message ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.role.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="admin-password"
                  className="dashboard-field-label"
                >
                  Password {passwordOptional ? "(optional)" : ""}
                </Label>
                <Input
                  id="admin-password"
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
