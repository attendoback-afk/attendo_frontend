"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AdminForm } from "@/forms/admin/admin-form";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/lib/api/services";
import type { StaffRecord } from "@/lib/api/types";

export default function EditAdminPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const adminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [admin, setAdmin] = useState<StaffRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAdmin() {
      setLoading(true);
      setError(null);
      try {
        const record = await staffApi.get(adminId);
        if (active) setAdmin(record);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load admin.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    if (adminId) void loadAdmin();
    return () => {
      active = false;
    };
  }, [adminId]);

  return (
    <DashboardLayout
      title="Edit Admin"
      description="Update admin account details"
    >
      {loading ? (
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading admin...
        </div>
      ) : error ? (
        <div className="dashboard-panel p-6 text-sm text-destructive">
          {error}
        </div>
      ) : admin ? (
        <AdminForm
          cancelHref={`/admins/${admin.userId}`}
          defaultValue={admin}
          submitLabel="Save Changes"
          passwordOptional
          onSubmit={async (values) => {
            await staffApi.update(admin.userId, {
              fullName: values.fullName.trim(),
              email: values.email.trim().toLowerCase(),
              role: values.role,
              ...(values.password ? { password: values.password } : {}),
            });
            toast({
              title: "Admin updated",
              description: "The admin account has been saved.",
            });
            router.push(`/admins/${admin.userId}`);
            router.refresh();
          }}
        />
      ) : null}
    </DashboardLayout>
  );
}
