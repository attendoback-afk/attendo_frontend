"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  description,
  action,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="min-h-screen w-full md:ml-[300px] lg:ml-[320px] xl:ml-[340px] 2xl:ml-[360px]">
        <div className="dashboard-main">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          <div className="mb-7 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="dashboard-heading">{title}</h1>
              {description && (
                <p className="dashboard-subheading">{description}</p>
              )}
            </div>
            {action && <div className="hidden shrink-0 md:block">{action}</div>}
          </div>
          {children}
        </div>
      </main>
    </>
  );
}
