"use client";

import Link from "next/link";
import { ClipboardCheck, QrCode, UsersRound } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton } from "@/components/dashboard-kit";
import { LiveAttendanceSessionsSection } from "@/components/live-session/live-attendance-sessions-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AttendancePage() {
  return (
    <DashboardLayout
      title="Attendance"
      description="Choose between QR attendance and manual attendance workflows"
      action={
        <Link href="/attendance/manual">
          <PageActionButton icon={ClipboardCheck}>Manual Attendance</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <div className="grid gap-3 xl:grid-cols-2">
          <Card className="dashboard-panel gap-0 py-0">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef4ff] text-[#93a6d7]">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">
                    QR Attendance
                  </h2>
                  <p className="text-[13px] text-muted-foreground">
                    Start or monitor live QR attendance sessions.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild type="button" variant="outline" className="rounded-lg">
                  <Link href="/sessions">Start from Sessions</Link>
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-lg">
                  <Link href="/sessions/live">Live Sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-panel gap-0 py-0">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf8e8] text-[#78ae5e]">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">
                    Manual Attendance
                  </h2>
                  <p className="text-[13px] text-muted-foreground">
                    Mark, bulk update, edit, delete, and report without QR scanning.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild type="button" className="rounded-lg">
                  <Link href="/attendance/manual">Attendance List</Link>
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-lg">
                  <Link href="/attendance/manual/mark">Mark</Link>
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-lg">
                  <Link href="/attendance/manual/bulk">Bulk</Link>
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-lg">
                  <Link href="/attendance/manual/report">Report</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <LiveAttendanceSessionsSection />
      </div>
    </DashboardLayout>
  );
}
