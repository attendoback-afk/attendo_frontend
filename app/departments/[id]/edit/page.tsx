"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DepartmentForm } from "@/forms/department/department-form";
import { departmentFormDefinition } from "@/forms/department/department-definition";
import { useToast } from "@/hooks/use-toast";
import { departmentsApi } from "@/lib/api/services";
import type { DepartmentRecord } from "@/lib/api/types";

export default function EditDepartmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const departmentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [department, setDepartment] = useState<DepartmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDepartment() {
      setLoading(true);
      setError(null);

      try {
        const record = await departmentsApi.get(departmentId);

        if (active) {
          setDepartment(record);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the department.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (departmentId) {
      void loadDepartment();
    }

    return () => {
      active = false;
    };
  }, [departmentId]);

  return (
    <DashboardLayout title="Edit Department" description="Update the selected department">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading department...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : department ? (
        <DepartmentForm
          cancelHref={`/departments/${department.id}`}
          defaultValues={{
            name: department.name,
            description: department.description ?? "",
          }}
          submitLabel="Update Department"
          submittingLabel="Updating Department..."
          onSubmit={async (values) => {
            await departmentsApi.update(department.id, departmentFormDefinition.formatPayload(values));
            toast({
              title: "Department updated",
              description: "The department details were saved successfully.",
            });
            router.push(`/departments/${department.id}`);
            router.refresh();
          }}
        />
      ) : (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Department not found.
        </div>
      )}
    </DashboardLayout>
  );
}
