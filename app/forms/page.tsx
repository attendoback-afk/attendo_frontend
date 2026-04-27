"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formRegistry } from "@/forms/form-registry";

export default function FormsPage() {
  const [activeForm, setActiveForm] = useState<(typeof formRegistry)[number]["value"]>("admin");
  const current = formRegistry.find((item) => item.value === activeForm) ?? formRegistry[0];
  const ActiveForm = current.Component;

  return (
    <DashboardLayout
      title="Forms System"
      description="Reusable form architecture for the main schema entities."
    >
      <div className="dashboard-page">
        <Tabs value={activeForm} onValueChange={(value) => setActiveForm(value as typeof activeForm)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-lg bg-transparent p-0 md:grid-cols-5">
            {formRegistry.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-background"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ActiveForm />
      </div>
    </DashboardLayout>
  );
}
