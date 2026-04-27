"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import type { InferType } from "yup";
import { useState } from "react";
import { BulkUploadModal, type PreviewRow } from "@/components/bulk-upload/bulk-upload-modal";
import { PageActionButton } from "@/components/dashboard-kit";
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
import { Switch } from "@/components/ui/switch";
import { useAdmins } from "@/hooks/use-admins";
import { usePasswordGenerator } from "@/hooks/use-password-generator";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_ROLE_OPTIONS } from "@/lib/people-store";
import { generateStrongPassword } from "@/lib/password";
import { adminFormSchema } from "@/validators/admin-form-schema";

type AdminFormData = InferType<typeof adminFormSchema>;

const defaultValues: AdminFormData = {
  fullName: "",
  email: "",
  password: "",
  role: "admin",
  active: true,
};

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "active"].includes(normalized);
}

export function AdminForm({ cancelHref }: { cancelHref?: string }) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const { toast } = useToast();
  const { createPassword } = usePasswordGenerator();
  const { admins, addAdmin, addAdmins } = useAdmins();
  const methods = useForm<AdminFormData>({
    resolver: yupResolver(adminFormSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleGeneratePassword = () => {
    methods.setValue("password", createPassword(), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = methods.handleSubmit(async (values) => {
    addAdmin({
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: values.role,
      active: values.active,
    });

    methods.reset(defaultValues);
    toast({
      title: "Admin created",
      description: "The admin account has been added successfully.",
    });
  });

  const buildPreview = async (rows: Record<string, unknown>[]) => {
    const existingEmails = new Set(admins.map((admin) => admin.email.toLowerCase()));
    const seenEmails = new Set<string>();

    return Promise.all(
      rows.map(async (row, index) => {
        const values: AdminFormData = {
          fullName: String(row.fullname ?? row["full name"] ?? "").trim(),
          email: String(row.email ?? "").trim().toLowerCase(),
          password: generateStrongPassword(),
          role: String(row.role ?? "").trim().toLowerCase() as AdminFormData["role"],
          active: normalizeBoolean(row.active),
        };

        const errors: string[] = [];

        try {
          await adminFormSchema.validate(values, { abortEarly: false });
        } catch (error) {
          if (error instanceof Error && "inner" in error) {
            const inner = (error as { inner?: Array<{ message: string }> }).inner ?? [];
            errors.push(...inner.map((item) => item.message));
          } else if (error instanceof Error) {
            errors.push(error.message);
          }
        }

        if (existingEmails.has(values.email)) {
          errors.push("Email already exists");
        }

        if (seenEmails.has(values.email)) {
          errors.push("Duplicate email in file");
        }

        seenEmails.add(values.email);

        return {
          index: index + 2,
          values,
          errors,
        } satisfies PreviewRow<AdminFormData>;
      }),
    );
  };

  const handleBulkConfirm = async (rows: AdminFormData[]) => {
    addAdmins(
      rows.map((row) => ({
        fullName: row.fullName.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password,
        role: row.role,
        active: row.active,
      })),
    );

    toast({
      title: "Admins imported",
      description: `${rows.length} admin records were added successfully.`,
    });
  };

  return (
    <>
      <Form {...methods}>
        <form onSubmit={handleSubmit} className="dashboard-page" noValidate>
          <Card className="dashboard-panel gap-0 py-0">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="dashboard-section-title">Admin Information</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create individual admin, manager, or teacher accounts.
                  </p>
                </div>
                <PageActionButton type="button" variant="outline" onClick={() => setBulkOpen(true)}>
                  Bulk Upload
                </PageActionButton>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="admin-full-name" className="dashboard-field-label">Full Name</Label>
                  <Input
                    id="admin-full-name"
                    placeholder="Enter full name"
                    className="rounded-lg"
                    aria-invalid={Boolean(methods.formState.errors.fullName)}
                    disabled={methods.formState.isSubmitting}
                    {...methods.register("fullName")}
                  />
                  {methods.formState.errors.fullName?.message ? (
                    <p className="text-sm text-destructive">{methods.formState.errors.fullName.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-email" className="dashboard-field-label">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@attendo.edu"
                    className="rounded-lg"
                    aria-invalid={Boolean(methods.formState.errors.email)}
                    disabled={methods.formState.isSubmitting}
                    {...methods.register("email")}
                  />
                  {methods.formState.errors.email?.message ? (
                    <p className="text-sm text-destructive">{methods.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-role" className="dashboard-field-label">Role</Label>
                  <Controller
                    control={methods.control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={methods.formState.isSubmitting}>
                        <SelectTrigger id="admin-role" className="rounded-lg">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {methods.formState.errors.role?.message ? (
                    <p className="text-sm text-destructive">{methods.formState.errors.role.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="admin-password" className="dashboard-field-label">Password</Label>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      id="admin-password"
                      type="text"
                      placeholder="Create a secure password"
                      className="rounded-lg"
                      aria-invalid={Boolean(methods.formState.errors.password)}
                      disabled={methods.formState.isSubmitting}
                      {...methods.register("password")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg"
                      onClick={handleGeneratePassword}
                      disabled={methods.formState.isSubmitting}
                    >
                      Generate Password
                    </Button>
                  </div>
                  {methods.formState.errors.password?.message ? (
                    <p className="text-sm text-destructive">{methods.formState.errors.password.message}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="space-y-1">
                    <Label htmlFor="admin-active" className="dashboard-field-label">Active</Label>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Controls whether the account is active immediately.
                    </p>
                  </div>
                  <Controller
                    control={methods.control}
                    name="active"
                    render={({ field }) => (
                      <Switch
                        id="admin-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={methods.formState.isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            {cancelHref ? (
              <Button asChild variant="outline" className="min-w-[96px] rounded-lg" type="button">
                <a href={cancelHref}>Cancel</a>
              </Button>
            ) : null}
            <Button className="min-w-[140px] rounded-lg" type="submit" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? "Creating Admin..." : "Create Admin"}
            </Button>
          </div>
        </form>
      </Form>

      <BulkUploadModal<AdminFormData>
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Bulk Upload Admins"
        description="Upload a CSV or XLSX file, review the preview, and confirm the import."
        expectedColumns={["fullName", "email", "role", "active"]}
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "active", label: "Active" },
          { key: "password", label: "Generated Password" },
        ]}
        buildPreview={buildPreview}
        onConfirm={handleBulkConfirm}
      />
    </>
  );
}
