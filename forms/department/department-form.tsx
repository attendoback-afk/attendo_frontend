"use client";

import { useToast } from "@/hooks/use-toast";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { departmentFormDefinition } from "@/forms/department/department-definition";
import { useDepartments } from "@/hooks/use-departments";

export function DepartmentForm({ cancelHref }: { cancelHref?: string }) {
  const { toast } = useToast();
  const { addDepartment } = useDepartments();

  return (
    <FormBuilder
      fields={departmentFormDefinition.fields}
      validationSchema={departmentFormDefinition.schema}
      defaultValues={departmentFormDefinition.defaultValues}
      submitLabel={departmentFormDefinition.submitLabel}
      submittingLabel="Creating Department..."
      cancelHref={cancelHref}
      onSubmit={async (data) => {
        const payload = departmentFormDefinition.formatPayload(data);
        addDepartment(payload);
      }}
      onSubmitSuccess={(_, methods) => {
        methods.reset(departmentFormDefinition.defaultValues);
        toast({
          title: "Department created",
          description: "The new department has been added successfully.",
        });
      }}
    />
  );
}
