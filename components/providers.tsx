"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthRouteGuard, isPublicPath } from "@/components/providers/auth-route-guard";
import { DepartmentProvider } from "@/components/providers/department-provider";
import { PeopleProvider } from "@/components/providers/people-provider";
import { AppQueryProvider } from "@/components/providers/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const publicPath = isPublicPath(pathname);

  return (
    <AppQueryProvider>
      <AuthProvider>
        <SidebarProvider>
          <AuthRouteGuard>
            {publicPath ? (
              children
            ) : (
              <PeopleProvider>
                <DepartmentProvider>{children}</DepartmentProvider>
              </PeopleProvider>
            )}
          </AuthRouteGuard>
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </AppQueryProvider>
  );
}
