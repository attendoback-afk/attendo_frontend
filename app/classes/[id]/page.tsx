"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classesApi, departmentsApi } from "@/lib/api/services";
import type { ClassRecord, DepartmentRecord } from "@/lib/api/types";

function formatDate(value: string | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function classCode(classRecord: ClassRecord) {
  return classRecord.classCode ?? classRecord.code ?? "N/A";
}

function departmentLabel(classRecord: ClassRecord, departments: Map<string, DepartmentRecord>) {
  if (classRecord.department) {
    return classRecord.department.code
      ? `${classRecord.department.code} - ${classRecord.department.name}`
      : classRecord.department.name;
  }

  const departmentId = classRecord.departmentId ? String(classRecord.departmentId) : "";

  if (departmentId && departments.has(departmentId)) {
    const department = departments.get(departmentId);
    return department ? `${department.code ? `${department.code} - ` : ""}${department.name}` : "N/A";
  }

  return "N/A";
}

export default function ClassDetailsPage() {
  const params = useParams<{ id: string }>();
  const classId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [classRecord, setClassRecord] = useState<ClassRecord | null>(null);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadClass() {
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
      void loadClass();
    }

    return () => {
      active = false;
    };
  }, [classId]);

  const departmentMap = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );

  return (
    <DashboardLayout
      title="Class Details"
      description="Review the selected class"
      action={
        classRecord ? (
          <Button asChild className="rounded-xl">
            <Link href={`/classes/${classRecord.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Class
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="dashboard-page">
        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading class details...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : classRecord ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{classRecord.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{classCode(classRecord)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {departmentLabel(classRecord, departmentMap)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {classRecord.year ?? classRecord.level ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {classRecord.description ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatDate(classRecord.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated Date</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatDate(classRecord.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="mt-1 break-all text-[18px] font-semibold text-foreground">
                    {classRecord.id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Class not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
