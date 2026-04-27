"use client";

import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
import { usePasswordGenerator } from "@/hooks/use-password-generator";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { generateStrongPassword } from "@/lib/password";
import { studentFormSchema } from "@/validators/student-form-schema";

type StudentFormData = InferType<typeof studentFormSchema>;

const defaultValues: StudentFormData = {
  fullName: "",
  email: "",
  password: "",
  studentCode: "",
  active: true,
};

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "active"].includes(normalized);
}

export function StudentForm({ cancelHref }: { cancelHref?: string }) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const { toast } = useToast();
  const { createPassword } = usePasswordGenerator();
  const { students, addStudent, addStudents } = useStudents();
  const methods = useForm<StudentFormData>({
    resolver: yupResolver(studentFormSchema),
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
    const normalizedCode = values.studentCode.trim();
    const alreadyExists = students.some(
      (student) => student.studentCode.toLowerCase() === normalizedCode.toLowerCase(),
    );

    if (alreadyExists) {
      methods.setError("studentCode", {
        type: "manual",
        message: "Student code must be unique",
      });
      return;
    }

    addStudent({
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      studentCode: normalizedCode,
      active: values.active,
    });

    methods.reset(defaultValues);
    toast({
      title: "Student created",
      description: "The student account has been added successfully.",
    });
  });

  const buildPreview = async (rows: Record<string, unknown>[]) => {
    const existingCodes = new Set(students.map((student) => student.studentCode.toLowerCase()));
    const seenCodes = new Set<string>();

    return Promise.all(
      rows.map(async (row, index) => {
        const values: StudentFormData = {
          fullName: String(row.fullname ?? row["full name"] ?? "").trim(),
          email: String(row.email ?? "").trim().toLowerCase(),
          password: generateStrongPassword(),
          studentCode: String(row.studentcode ?? row["student code"] ?? "").trim(),
          active: normalizeBoolean(row.active),
        };

        const errors: string[] = [];

        try {
          await studentFormSchema.validate(values, { abortEarly: false });
        } catch (error) {
          if (error instanceof Error && "inner" in error) {
            const inner = (error as { inner?: Array<{ message: string }> }).inner ?? [];
            errors.push(...inner.map((item) => item.message));
          } else if (error instanceof Error) {
            errors.push(error.message);
          }
        }

        const normalizedCode = values.studentCode.toLowerCase();

        if (existingCodes.has(normalizedCode)) {
          errors.push("Student code already exists");
        }

        if (seenCodes.has(normalizedCode)) {
          errors.push("Duplicate student code in file");
        }

        seenCodes.add(normalizedCode);

        return {
          index: index + 2,
          values,
          errors,
        } satisfies PreviewRow<StudentFormData>;
      }),
    );
  };

  const handleBulkConfirm = async (rows: StudentFormData[]) => {
    addStudents(
      rows.map((row) => ({
        fullName: row.fullName.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password,
        studentCode: row.studentCode.trim(),
        active: row.active,
      })),
    );

    toast({
      title: "Students imported",
      description: `${rows.length} student records were added successfully.`,
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
                  <h2 className="dashboard-section-title">Student Information</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create individual student accounts or import them in bulk.
                  </p>
                </div>
                <PageActionButton type="button" variant="outline" onClick={() => setBulkOpen(true)}>
                  Bulk Upload
                </PageActionButton>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="student-full-name" className="dashboard-field-label">Full Name</Label>
                  <Input
                    id="student-full-name"
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
                  <Label htmlFor="student-email" className="dashboard-field-label">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@attendo.edu"
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
                  <Label htmlFor="student-code" className="dashboard-field-label">Student Code</Label>
                  <Input
                    id="student-code"
                    placeholder="Enter student code"
                    className="rounded-lg"
                    aria-invalid={Boolean(methods.formState.errors.studentCode)}
                    disabled={methods.formState.isSubmitting}
                    {...methods.register("studentCode")}
                  />
                  {methods.formState.errors.studentCode?.message ? (
                    <p className="text-sm text-destructive">{methods.formState.errors.studentCode.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2 md:col-span-2 xl:col-span-2">
                  <Label htmlFor="student-password" className="dashboard-field-label">Password</Label>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      id="student-password"
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
                    <Label htmlFor="student-active" className="dashboard-field-label">Active</Label>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Controls whether the student account is active immediately.
                    </p>
                  </div>
                  <Controller
                    control={methods.control}
                    name="active"
                    render={({ field }) => (
                      <Switch
                        id="student-active"
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
                <Link href={cancelHref}>Cancel</Link>
              </Button>
            ) : null}
            <Button className="min-w-[140px] rounded-lg" type="submit" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? "Creating Student..." : "Create Student"}
            </Button>
          </div>
        </form>
      </Form>

      <BulkUploadModal<StudentFormData>
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Bulk Upload Students"
        description="Upload a CSV or XLSX file, review the preview, and confirm the import."
        expectedColumns={["fullName", "email", "studentCode", "active"]}
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "studentCode", label: "Student Code" },
          { key: "active", label: "Active" },
          { key: "password", label: "Generated Password" },
        ]}
        buildPreview={buildPreview}
        onConfirm={handleBulkConfirm}
      />
    </>
  );
}
