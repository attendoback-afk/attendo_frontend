"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentForm } from "@/forms/student/student-form";

export default function NewStudentPage() {
  return (
    <DashboardLayout
      title="Add New Student"
      description="Create student accounts individually or from a spreadsheet import."
    >
      <StudentForm cancelHref="/students" />
    </DashboardLayout>
  );
}
