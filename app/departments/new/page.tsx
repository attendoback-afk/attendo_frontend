"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DepartmentForm } from "@/forms/department/department-form";

export default function NewDepartmentPage() {
  return (
    <DashboardLayout
      title="Create New Department"
      description="Add a department using the shared form workflow."
    >
      <DepartmentForm cancelHref="/departments" />
    </DashboardLayout>
  );
}
