"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Plus, RefreshCw, UsersRound } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton } from "@/components/dashboard-kit";
import {
  ManualAttendanceRecordsTable,
  manualStatusLabels,
} from "@/components/manual-attendance/manual-attendance-widgets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  readManualAttendanceError,
  useManualAttendanceController,
  useManualAttendanceReferenceData,
} from "@/hooks/useManualAttendance";
import type {
  ManualAttendanceRecord,
  ManualAttendanceStatus,
} from "@/types/manual-attendance";
import { MANUAL_ATTENDANCE_STATUSES } from "@/types/manual-attendance";

function entityLabel(record: { id: string | number; name?: string; code?: string } | null | undefined) {
  if (!record) {
    return "";
  }

  return record.code ? `${record.code} - ${record.name}` : (record.name ?? String(record.id));
}

function sessionLabel(record: { id: string | number; module?: { name?: string }; class?: { name?: string }; startTime?: string } | null | undefined) {
  if (!record) {
    return "";
  }

  return [record.module?.name, record.class?.name, record.startTime]
    .filter(Boolean)
    .join(" - ") || String(record.id);
}

export default function ManualAttendanceView() {
  const { toast } = useToast();
  const [recordToDelete, setRecordToDelete] =
    useState<ManualAttendanceRecord | null>(null);
  const referenceQuery = useManualAttendanceReferenceData();
  const controller = useManualAttendanceController();
  const error = referenceQuery.error ?? controller.error;

  async function confirmDelete() {
    if (!recordToDelete) {
      return;
    }

    try {
      await controller.deleteRecord(String(recordToDelete.id));
      toast({
        title: "Attendance deleted",
        description: "The attendance record has been removed.",
      });
      setRecordToDelete(null);
    } catch (deleteError) {
      toast({
        title: "Unable to delete attendance",
        description: readManualAttendanceError(deleteError, "Please try again."),
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout
      title="Manual Attendance"
      description="Mark and manage attendance without QR scanning"
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/attendance/manual/report">
            <PageActionButton icon={BarChart3} variant="outline">
              Report
            </PageActionButton>
          </Link>
          <Link href="/attendance/manual/bulk">
            <PageActionButton icon={UsersRound} variant="outline">
              Bulk
            </PageActionButton>
          </Link>
          <Link href="/attendance/manual/mark">
            <PageActionButton icon={Plus}>Mark Attendance</PageActionButton>
          </Link>
        </div>
      }
    >
      <div className="dashboard-page">
        {error || controller.validationError ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>
              {controller.validationError ??
                readManualAttendanceError(error, "Unable to load manual attendance.")}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
            <Select
              value={controller.filters.sessionId}
              onValueChange={(value) => controller.updateFilter("sessionId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic session" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.sessions ?? []).map((session) => (
                  <SelectItem key={session.id} value={String(session.id)}>
                    {sessionLabel(session)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={controller.filters.classId}
              onValueChange={(value) => controller.updateFilter("classId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.classes ?? []).map((classRecord) => (
                  <SelectItem key={classRecord.id} value={String(classRecord.id)}>
                    {entityLabel(classRecord)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={controller.filters.date}
              onChange={(event) => controller.updateFilter("date", event.target.value)}
            />

            <Select
              value={controller.filters.status}
              onValueChange={(value) =>
                controller.updateFilter(
                  "status",
                  value as ManualAttendanceStatus | "all",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {MANUAL_ATTENDANCE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {manualStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              className="rounded-lg"
              disabled={controller.isLoading || !controller.canLoad}
              onClick={controller.loadAttendance}
            >
              <RefreshCw className="h-4 w-4" />
              {controller.isLoading ? "Loading..." : "Load Attendance"}
            </Button>
          </CardContent>
        </Card>

        <ManualAttendanceRecordsTable
          records={controller.records}
          loading={controller.isLoading}
          emptyMessage={
            controller.submittedFilters
              ? "No attendance records match these filters."
              : "Select filters and load attendance."
          }
          deleting={controller.isDeleting}
          onDelete={setRecordToDelete}
        />
      </div>

      <AlertDialog
        open={Boolean(recordToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setRecordToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
