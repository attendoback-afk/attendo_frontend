"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  LiveAttendanceRecord,
  LiveSessionStatus,
  LiveSessionSummary,
} from "@/types/live";

export function formatLiveDateTime(value?: string | null) {
  if (!value) {
    return "-";
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

export function LiveStatusBadge({
  status,
  className,
}: {
  status?: LiveSessionStatus;
  className?: string;
}) {
  const normalizedStatus = status ?? "UNKNOWN";
  const tone =
    normalizedStatus === "ACTIVE"
      ? "border-[#dcefd6] bg-[#edf8e8] text-[#5d9b43]"
      : normalizedStatus === "EXPIRED"
        ? "border-[#ffdbe0] bg-[#ffeef1] text-[#ef7e8a]"
        : "border-border bg-secondary text-muted-foreground";

  return (
    <Badge className={cn("h-7 rounded-md px-3", tone, className)}>
      {normalizedStatus}
    </Badge>
  );
}

export function LiveSessionSummaryGrid({
  summary,
}: {
  summary: LiveSessionSummary;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
        <p className="text-[13px] font-medium text-muted-foreground">Status</p>
        <div className="mt-2">
          <LiveStatusBadge status={summary.status} />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
        <p className="text-[13px] font-medium text-muted-foreground">Start Time</p>
        <p className="mt-2 text-[14px] font-semibold text-foreground">
          {formatLiveDateTime(summary.startTime)}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
        <p className="text-[13px] font-medium text-muted-foreground">End Time</p>
        <p className="mt-2 text-[14px] font-semibold text-foreground">
          {formatLiveDateTime(summary.endTime)}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
        <p className="text-[13px] font-medium text-muted-foreground">Total Marked</p>
        <p className="mt-2 text-[22px] font-semibold leading-none text-foreground">
          {summary.totalMarked}
        </p>
      </div>
    </div>
  );
}

export function LiveRecordsTable({
  records,
  emptyMessage = "No attendance records found.",
}: {
  records: LiveAttendanceRecord[];
  emptyMessage?: string;
}) {
  return (
    <Table>
      <TableHeader className="bg-[#fcfbff]">
        <TableRow>
          <TableHead>Record ID</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Attendance Session ID</TableHead>
          <TableHead>Marked At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium text-[#6f6a7e]">{record.id}</TableCell>
              <TableCell>{record.student?.userId ?? record.studentId}</TableCell>
              <TableCell className="max-w-[360px] truncate">
                {record.attendanceSessionId}
              </TableCell>
              <TableCell>{formatLiveDateTime(record.markedAt)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
