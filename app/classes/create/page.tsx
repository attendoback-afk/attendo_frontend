"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ClassForm } from "@/forms/class/class-form";
import { classFormDefinition } from "@/forms/class/class-definition";
import { useToast } from "@/hooks/use-toast";
import { classesApi, departmentsApi } from "@/lib/api/services";
import type { DepartmentRecord } from "@/lib/api/types";
import type { FieldOption } from "@/types/form-builder";

function mapDepartmentOptions(departments: DepartmentRecord[]): FieldOption[] {
  return departments.map((department) => ({
    value: department.id,
    label: `${department.code ? `${department.code} - ` : ""}${department.name}`,
  }));
}

export default function CreateClassPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      setLoading(true);
      setError(null);

      try {
        const records = await departmentsApi.list();

        if (active) {
          setDepartments(records);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load departments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout title="Create Class" description="Add a class to the catalog">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading department options...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : (
        <ClassForm
          cancelHref="/classes"
          departmentOptions={mapDepartmentOptions(departments)}
          submittingLabel="Creating Class..."
          onSubmit={async (values) => {
            await classesApi.create(classFormDefinition.formatPayload(values));
            toast({ title: "Class created", description: "The new class has been saved." });
            router.push("/classes");
            router.refresh();
          }}
        />
      )}
    </DashboardLayout>
  );
}
