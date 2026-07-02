"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LiveSessionsHistory } from "@/components/live-session/live-sessions-history";

export default function LiveSessionsPage() {
  return (
    <DashboardLayout
      title="Live Sessions"
      description="Review and manage your live attendance sessions"
    >
      <LiveSessionsHistory />
    </DashboardLayout>
  );
}
