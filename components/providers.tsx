"use client";

import type { ReactNode } from "react";
import { DepartmentProvider } from "@/components/providers/department-provider";
import { PeopleProvider } from "@/components/providers/people-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <PeopleProvider>
        <DepartmentProvider>
          {children}
          <Toaster />
        </DepartmentProvider>
      </PeopleProvider>
    </SidebarProvider>
  );
}
