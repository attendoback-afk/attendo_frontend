"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ModuleForm } from "@/forms/module/module-form";
import { modulesApi } from "@/lib/api/services";
import { moduleFormDefinition } from "@/forms/module/module-definition";
import { useToast } from "@/hooks/use-toast";

export default function CreateModulePage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <DashboardLayout
      title="Create New Module"
      description="Add a module to the academic catalog."
    >
      <ModuleForm
        cancelHref="/modules"
        submitLabel="Create Module"
        onSubmit={async (values) => {
          await modulesApi.create(moduleFormDefinition.formatPayload(values));
          toast({ title: "Module created", description: "The new module has been saved." });
          router.push("/modules");
          router.refresh();
        }}
      />
    </DashboardLayout>
  );
}
