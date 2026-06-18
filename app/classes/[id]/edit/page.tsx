"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ClassForm } from "@/forms/class/class-form";
import { classFormDefinition } from "@/forms/class/class-definition";
import { useToast } from "@/hooks/use-toast";
import { classesApi, departmentsApi } from "@/lib/api/services";
import type { ClassRecord, DepartmentRecord } from "@/lib/api/types";
import type { FieldOption } from "@/types/form-builder";

function mapDepartmentOptions(departments: DepartmentRecord[]): FieldOption[] {
  return departments.map((department) => ({
    value: department.id,
    label: `${department.code ? `${department.code} - ` : ""}${department.name}`,
  }));
}

export default function EditClassPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const classId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [classRecord, setClassRecord] = useState<ClassRecord | null>(null);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [record, departmentRecords] = await Promise.all([
          classesApi.get(classId),
          departmentsApi.list(),
        ]);

        if (!active) {
          return;
        }

        setClassRecord(record);
        setDepartments(departmentRecords);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the class.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (classId) {
      void loadData();
    }

    return () => {
      active = false;
    };
  }, [classId]);

  return (
    <DashboardLayout title="Edit Class" description="Update the selected class">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading class...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : classRecord ? (
        <ClassForm
          cancelHref={`/classes/${classRecord.id}`}
          departmentOptions={mapDepartmentOptions(departments)}
          defaultValues={{
            name: classRecord.name,
            classCode: classRecord.classCode ?? classRecord.code ?? "",
            departmentId: String(classRecord.departmentId ?? classRecord.department?.id ?? ""),
            year: String(classRecord.year ?? classRecord.level ?? ""),
            description: classRecord.description ?? "",
          }}
          submitLabel="Update Class"
          submittingLabel="Updating Class..."
          onSubmit={async (values) => {
            await classesApi.update(classRecord.id, classFormDefinition.formatPayload(values));
            toast({
              title: "Class updated",
              description: "The class details were saved successfully.",
            });
            router.push(`/classes/${classRecord.id}`);
            router.refresh();
          }}
        />
      ) : (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Class not found.
        </div>
      )}
    </DashboardLayout>
  );
}
