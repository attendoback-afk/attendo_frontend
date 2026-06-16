"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ModuleForm } from "@/forms/module/module-form";
import { moduleFormDefinition } from "@/forms/module/module-definition";
import { modulesApi } from "@/lib/api/services";
import type { ModuleRecord } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

export default function EditModulePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
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
    <DashboardLayout title="Edit Module" description="Update module information">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading module...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : moduleRecord ? (
        <ModuleForm
          cancelHref={`/modules/${moduleRecord.id}`}
          defaultValues={{
            name: moduleRecord.name,
            code: moduleRecord.code,
            description: moduleRecord.description ?? "",
          }}
          submitLabel="Update Module"
          onSubmit={async (values) => {
            await modulesApi.update(moduleRecord.id, moduleFormDefinition.formatPayload(values));
            toast({ title: "Module updated", description: "The module details were saved successfully." });
            router.push(`/modules/${moduleRecord.id}`);
            router.refresh();
          }}
        />
      ) : (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Module not found.
        </div>
      )}
    </DashboardLayout>
  );
}
