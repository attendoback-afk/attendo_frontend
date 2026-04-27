"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ModuleForm } from "@/forms/module/module-form";

export default function NewModulePage() {
  return (
    <DashboardLayout title="Create New Module" description="Create a module using the shared form builder.">
      <ModuleForm cancelHref="/modules" />
    </DashboardLayout>
  );
}
