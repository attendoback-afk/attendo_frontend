"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ManualAttendanceRecord,
  ManualAttendanceStatus,
} from "@/types/manual-attendance";
import { MANUAL_ATTENDANCE_STATUSES } from "@/types/manual-attendance";

export const manualStatusLabels: Record<ManualAttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
};

export function studentName(record: ManualAttendanceRecord) {
  return (
    record.student?.fullName ??
    record.student?.user?.fullName ??
    record.student?.user?.name ??
    record.student?.name ??
    `Student ${record.studentId}`
  );
}

export function studentInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
}

export function ManualAttendanceStatusBadge({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) {
  const normalized = String(status ?? "UNKNOWN").toUpperCase();
  const tone =
    normalized === "PRESENT"
      ? "border-[#dcefd6] bg-[#edf8e8] text-[#5d9b43]"
      : normalized === "ABSENT"
        ? "border-[#ffdbe0] bg-[#ffeef1] text-[#ef7e8a]"
        : normalized === "LATE"
          ? "border-[#f4e3bd] bg-[#fff7e5] text-[#b7791f]"
          : "border-border bg-secondary text-muted-foreground";

  return (
    <Badge className={cn("h-7 rounded-md px-3", tone, className)}>
      {normalized}
    </Badge>
  );
}

export function ManualStatusSelect({
  value,
  onValueChange,
  placeholder = "Select status",
}: {
  value?: string;
  onValueChange: (value: ManualAttendanceStatus) => void;
  placeholder?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as ManualAttendanceStatus)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {MANUAL_ATTENDANCE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {manualStatusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ManualAttendanceStudentCell({
  record,
}: {
  record: ManualAttendanceRecord;
}) {
  const name = studentName(record);
  const imageUrl = record.student?.imageUrl ?? record.student?.avatarUrl ?? undefined;

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Avatar className="h-10 w-10 border border-border bg-[#eef4ff]">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="bg-[#eef4ff] text-[13px] font-semibold text-[#6578ad]">
          {studentInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
        <p className="truncate text-[12px] text-muted-foreground">
          {record.student?.studentCode ?? record.student?.email ?? record.studentId}
        </p>
      </div>
    </div>
  );
}

export function ManualAttendanceRecordsTable({
  records,
  loading,
  emptyMessage = "No attendance records found.",
  onDelete,
  deleting,
}: {
  records: ManualAttendanceRecord[];
  loading?: boolean;
  emptyMessage?: string;
  onDelete?: (record: ManualAttendanceRecord) => void;
  deleting?: boolean;
}) {
  return (
    <Card className="dashboard-panel gap-0 overflow-hidden py-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#fcfbff]">
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading attendance...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <ManualAttendanceStudentCell record={record} />
                  </TableCell>
                  <TableCell>
                    <ManualAttendanceStatusBadge status={record.status} />
                  </TableCell>
                  <TableCell>{record.date ?? "-"}</TableCell>
                  <TableCell className="max-w-[260px] truncate">
                    {record.sessionId ?? record.session?.id ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                        <Link
                          href={`/attendance/manual/${record.id}/edit?status=${encodeURIComponent(
                            String(record.status),
                          )}`}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit attendance</span>
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                        disabled={deleting}
                        onClick={() => onDelete?.(record)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete attendance</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ManualAttendanceMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-[#5d9b43]",
    danger: "text-[#ef7e8a]",
    warning: "text-[#b7791f]",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-[24px] font-semibold leading-none", toneClass)}>
        {value}
      </p>
    </div>
  );
}
