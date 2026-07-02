"use client";

import { Activity, Clock3, Play, RefreshCw, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLiveSessionController } from "@/hooks/useLiveSession";
import type { LiveQrPayload } from "@/types/live";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not started";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusTone(status?: string) {
  return status === "ACTIVE"
    ? "border-[#dcefd6] bg-[#edf8e8] text-[#5d9b43]"
    : "border-[#ffdbe0] bg-[#ffeef1] text-[#ef7e8a]";
}

export function LiveSessionDashboard() {
  const {
    loading,
    closing,
    records,
    summary,
    secret,
    sessionId,
    startTime,
    countdown,
    error,
    closed,
    isActive,
    startSession,
    closeSession,
  } = useLiveSessionController();

  const qrPayload: LiveQrPayload | null =
    isActive && sessionId && secret ? { sessionId, token: secret } : null;
  const totalMarked = summary?.totalMarked ?? records.length;
  const status = closed ? "CLOSED" : summary?.status ?? (isActive ? "ACTIVE" : "IDLE");

  return (
    <div className="dashboard-page">
      {error ? (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="dashboard-panel gap-0 py-0">
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Session Status</p>
                <Badge className={cn("mt-2 h-7 rounded-md px-3", statusTone(status))}>
                  {status}
                </Badge>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Session ID</p>
                <p className="mt-2 max-w-[260px] truncate text-[14px] font-semibold text-foreground">
                  {sessionId || "No active session"}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Start Time</p>
                <p className="mt-2 text-[14px] font-semibold text-foreground">
                  {formatDateTime(summary?.startTime ?? startTime)}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Total Attendance</p>
                <p className="mt-2 flex items-center gap-2 text-[22px] font-semibold leading-none text-foreground">
                  <Activity className="h-5 w-5 text-[#93a6d7]" />
                  {totalMarked}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:justify-end">
              <Button
                type="button"
                className="rounded-lg"
                disabled={loading || isActive}
                onClick={() => void startSession()}
              >
                <Play className="h-4 w-4" />
                {loading ? "Starting..." : "Start Session"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-lg"
                disabled={!isActive || closing}
                onClick={() => void closeSession()}
              >
                <Square className="h-4 w-4" />
                {closing ? "Closing..." : "Close Session"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-panel gap-0 py-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5">
            <div
              className={cn(
                "flex h-[280px] w-full max-w-[280px] items-center justify-center rounded-lg border border-border bg-white p-5 transition-opacity",
                !qrPayload && "bg-muted opacity-60",
              )}
              aria-label="Live attendance QR code"
            >
              {qrPayload ? (
                <QRCodeSVG
                  value={JSON.stringify(qrPayload)}
                  size={232}
                  level="M"
                  includeMargin
                />
              ) : (
                <RefreshCw className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="grid w-full max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
                <p className="text-[13px] font-medium text-muted-foreground">Current Token</p>
                <p className="mt-1 text-[24px] font-semibold tracking-normal text-foreground">
                  {secret || "----"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
                <p className="text-[13px] font-medium text-muted-foreground">Countdown</p>
                <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-[#93a6d7]" />
                  {isActive ? `Refreshing in ${countdown} sec` : "Refreshing paused"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-panel gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student Code</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Class ID</TableHead>
                <TableHead>Face</TableHead>
                <TableHead>Marked At</TableHead>
                <TableHead>Attendance Session ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {isActive ? "No attendance records yet." : "Start a live session to collect attendance."}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex min-w-[220px] flex-col gap-1">
                        <span className="font-medium text-foreground">
                          {record.student?.user?.fullName ?? "Unknown student"}
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          {record.student?.user?.email ?? "No email available"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-[#6f6a7e]">
                      {record.student?.studentCode ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium text-[#6f6a7e]">
                      {record.student?.userId ?? record.studentId}
                    </TableCell>
                    <TableCell>{record.student?.classId ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "h-6 rounded-md px-2.5",
                          record.student?.faceRegistered
                            ? "border-[#dcefd6] bg-[#edf8e8] text-[#5d9b43]"
                            : "border-[#ffdbe0] bg-[#ffeef1] text-[#ef7e8a]",
                        )}
                      >
                        {record.student?.faceRegistered ? "Registered" : "Not registered"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(record.markedAt)}</TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      {record.attendanceSessionId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
