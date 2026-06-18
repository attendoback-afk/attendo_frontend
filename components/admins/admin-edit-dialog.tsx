"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StaffRecord } from "@/lib/api/types";
import { STAFF_ROLE_VALUES } from "@/lib/api/types";
import { adminFormSchema } from "@/validators/admin-form-schema";

type AdminEditValues = InferType<typeof adminFormSchema>;

export function AdminEditDialog({
  admin,
  open,
  onOpenChange,
  onSubmit,
}: {
  admin: StaffRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminEditValues) => Promise<void> | void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const methods = useForm<AdminEditValues>({
    resolver: yupResolver(adminFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "MANAGER",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!admin) {
      return;
    }

    setSubmitError(null);
      methods.reset({
        fullName: admin.fullName,
        email: admin.email,
        password: admin.password,
        role: admin.role,
      });
  }, [admin, methods]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save admin changes.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>Update account details and save the changes.</DialogDescription>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-admin-full-name">Full Name</Label>
                <Input
                  id="edit-admin-full-name"
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
                <Label htmlFor="edit-admin-email">Email</Label>
                <Input
                  id="edit-admin-email"
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
                <Label htmlFor="edit-admin-role">Role</Label>
                <Controller
                  control={methods.control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={methods.formState.isSubmitting}>
                      <SelectTrigger id="edit-admin-role" className="rounded-lg">
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
                  <p className="text-sm text-destructive">{methods.formState.errors.role.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-admin-password">Password</Label>
                <Input
                  id="edit-admin-password"
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
