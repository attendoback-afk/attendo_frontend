"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { InferType } from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudentRecord } from "@/lib/api/types";
import { studentFormSchema } from "@/validators/student-form-schema";

type StudentEditValues = InferType<typeof studentFormSchema>;

export function StudentEditDialog({
  student,
  open,
  onOpenChange,
  onSubmit,
}: {
  student: StudentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StudentEditValues) => Promise<void> | void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const methods = useForm<StudentEditValues>({
    resolver: yupResolver(studentFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      studentCode: "",
      classId: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!student) {
      return;
    }

    setSubmitError(null);
      methods.reset({
        fullName: student.fullName,
        email: student.email,
        password: student.password,
        studentCode: student.studentCode,
        classId: student.classId,
      });
  }, [student, methods]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save student changes.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update the student record and save your changes.</DialogDescription>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-student-full-name">Full Name</Label>
                <Input
                  id="edit-student-full-name"
                  className="rounded-lg"
                  disabled={methods.formState.isSubmitting}
                  aria-invalid={Boolean(methods.formState.errors.fullName)}
                  {...methods.register("fullName")}
                />
                {methods.formState.errors.fullName?.message ? (
                  <p className="text-sm text-destructive">{methods.formState.errors.fullName.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-student-email">Email</Label>
                <Input
                  id="edit-student-email"
                  type="email"
                  className="rounded-lg"
                  disabled={methods.formState.isSubmitting}
                  aria-invalid={Boolean(methods.formState.errors.email)}
                  {...methods.register("email")}
                />
                {methods.formState.errors.email?.message ? (
                  <p className="text-sm text-destructive">{methods.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-student-code">Student Code</Label>
                <Input
                  id="edit-student-code"
                  className="rounded-lg"
                  disabled={methods.formState.isSubmitting}
                  aria-invalid={Boolean(methods.formState.errors.studentCode)}
                  {...methods.register("studentCode")}
                />
                {methods.formState.errors.studentCode?.message ? (
                  <p className="text-sm text-destructive">{methods.formState.errors.studentCode.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-student-password">Password</Label>
                <Input
                  id="edit-student-password"
                  type="text"
                  className="rounded-lg"
                  disabled={methods.formState.isSubmitting}
                  aria-invalid={Boolean(methods.formState.errors.password)}
                  {...methods.register("password")}
                />
                {methods.formState.errors.password?.message ? (
                  <p className="text-sm text-destructive">{methods.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-student-class-id">Class ID</Label>
                <Input
                  id="edit-student-class-id"
                  className="rounded-lg"
                  disabled={methods.formState.isSubmitting}
                  aria-invalid={Boolean(methods.formState.errors.classId)}
                  {...methods.register("classId")}
                />
                {methods.formState.errors.classId?.message ? (
                  <p className="text-sm text-destructive">{methods.formState.errors.classId.message}</p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => onOpenChange(false)}
                disabled={methods.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-lg" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
