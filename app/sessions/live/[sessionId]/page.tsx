"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { LiveSessionRoom } from "@/components/live-session/live-session-room";

export default function LiveSessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
    

  return (
    <DashboardLayout
      title="Live Attendance Session"
      description="Monitor QR access and attendance records in real time"
    >
      <LiveSessionRoom sessionId={sessionId} />
    </DashboardLayout>
  );
}
