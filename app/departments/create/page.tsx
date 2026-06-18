"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DepartmentForm } from "@/forms/department/department-form";
import { departmentFormDefinition } from "@/forms/department/department-definition";
import { useToast } from "@/hooks/use-toast";
import { departmentsApi } from "@/lib/api/services";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <DashboardLayout title="Create Department" description="Add a department to the catalog">
      <DepartmentForm
        cancelHref="/departments"
        submittingLabel="Creating Department..."
        onSubmit={async (values) => {
          await departmentsApi.create(departmentFormDefinition.formatPayload(values));
          toast({ title: "Department created", description: "The new department has been saved." });
          router.push("/departments");
          router.refresh();
        }}
      />
    </DashboardLayout>
  );
}
