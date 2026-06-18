"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { departmentsApi } from "@/lib/api/services";
import type { DepartmentRecord } from "@/lib/api/types";

function formatDate(value: string | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function DepartmentDetailsPage() {
  const params = useParams<{ id: string }>();
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
    <DashboardLayout
      title="Department Details"
      description="Review the selected department"
      action={
        department ? (
          <Button asChild className="rounded-xl">
            <Link href={`/departments/${department.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Department
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="dashboard-page">
        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading department details...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : department ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{department.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {department.description ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatDate(department.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated Date</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatDate(department.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="mt-1 break-all text-[18px] font-semibold text-foreground">
                    {department.id}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Department not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
