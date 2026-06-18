"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { staffApi } from "@/lib/api/services";
import type { StaffRecord } from "@/lib/api/types";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function AdminDetailsPage() {
  const params = useParams<{ id: string }>();
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
      title="Admin Details"
      description="Review the selected admin account"
      action={
        admin ? (
          <Button asChild className="rounded-xl">
            <Link href={`/admins/${admin.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Admin
            </Link>
          </Button>
        ) : null
      }
    >
      <Card className="dashboard-panel">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading admin details...
            </p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : admin ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Full Name" value={admin.user.fullName} />
              <Field label="Email" value={admin.user.email} />
              <Field label="Role" value={admin.role.name} />
              <Field
                label="Created Date"
                value={formatDate(admin.createdAt ?? admin.createdDate)}
              />
              <Field label="Updated Date" value={formatDate(admin.updatedAt)} />
              <Field label="ID" value={admin.userId} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Admin not found.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-[18px] font-semibold">{value}</p>
    </div>
  );
}
