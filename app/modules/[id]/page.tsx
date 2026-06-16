"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { modulesApi } from "@/lib/api/services";
import type { ModuleRecord } from "@/lib/api/types";

export default function ModuleDetailsPage() {
  const params = useParams<{ id: string }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [moduleRecord, setModuleRecord] = useState<ModuleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadModule() {
      setLoading(true);
      setError(null);

      try {
        const record = await modulesApi.get(moduleId);
        if (active) {
          setModuleRecord(record);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the module.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (moduleId) {
      void loadModule();
    }

    return () => {
      active = false;
    };
  }, [moduleId]);

  return (
    <DashboardLayout
      title="Module Details"
      description="View module information and manage the record"
      action={
        moduleRecord ? (
          <Button asChild className="rounded-xl">
            <Link href={`/modules/${moduleRecord.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Module
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="dashboard-page">
        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading module details...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : moduleRecord ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{moduleRecord.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{moduleRecord.code}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-[15px] leading-7 text-foreground">
                    {moduleRecord.description ?? "No description provided."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Module not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
