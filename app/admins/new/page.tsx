"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { AdminForm } from "@/forms/admin/admin-form";

export default function AddAdminPage() {
  return (
    <DashboardLayout
      title="Add New Admin"
      description="Create admin accounts individually or from a spreadsheet import."
    >
      <AdminForm cancelHref="/admins" />
    </DashboardLayout>
  );
}
