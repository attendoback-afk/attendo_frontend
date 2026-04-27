"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Department } from "@/lib/departments-store";
import { departmentFormSchema } from "@/validators/department-form-schema";

type DepartmentEditDialogProps = {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InferType<typeof departmentFormSchema>) => Promise<void> | void;
};

export function DepartmentEditDialog({
  department,
  open,
  onOpenChange,
  onSubmit,
}: DepartmentEditDialogProps) {
  const methods = useForm<InferType<typeof departmentFormSchema>>({
    resolver: yupResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!department) {
      return;
    }

    methods.reset({
      name: department.name,
      description: department.description,
    });
  }, [department, methods]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update the department details and save your changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
            <div className="grid gap-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                placeholder="Enter department name"
                disabled={methods.formState.isSubmitting}
                aria-invalid={Boolean(methods.formState.errors.name)}
                className="rounded-lg"
                {...methods.register("name")}
              />
              {methods.formState.errors.name?.message ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department-description">Description</Label>
              <Textarea
                id="department-description"
                placeholder="Describe the department"
                disabled={methods.formState.isSubmitting}
                aria-invalid={Boolean(methods.formState.errors.description)}
                className="min-h-[132px] rounded-lg"
                {...methods.register("description")}
              />
              {methods.formState.errors.description?.message ? (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.description.message}
                </p>
              ) : null}
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
              <Button
                type="submit"
                className="rounded-lg"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
