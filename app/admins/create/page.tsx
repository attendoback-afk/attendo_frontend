"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AdminForm } from "@/forms/admin/admin-form";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/lib/api/services";

export default function CreateAdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <DashboardLayout title="Create Admin" description="Add a new staff account">
      <AdminForm
        cancelHref="/admins"
        onSubmit={async (values) => {
          await staffApi.create({
            fullName: values.fullName.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
            role: values.role,
          });
          toast({ title: "Admin created", description: "The admin account has been saved." });
          router.push("/admins");
          router.refresh();
        }}
      />
    </DashboardLayout>
  );
}
