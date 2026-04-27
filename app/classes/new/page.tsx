"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { ClassForm } from "@/forms/class/class-form";

export default function NewClassPage() {
  return (
    <DashboardLayout
      title="Add New Class"
      description="Create a class using the shared form builder."
    >
      <ClassForm cancelHref="/classes" />
    </DashboardLayout>
  );
}
