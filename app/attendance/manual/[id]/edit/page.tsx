"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ManualStatusSelect } from "@/components/manual-attendance/manual-attendance-widgets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  manualAttendanceKeys,
  readManualAttendanceError,
} from "@/hooks/useManualAttendance";
import { manualAttendanceApi } from "@/services/manual-attendance";
import type { ManualAttendanceStatus } from "@/types/manual-attendance";
import { MANUAL_ATTENDANCE_STATUSES } from "@/types/manual-attendance";

export default function EditAttendanceView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const attendanceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialStatus = useMemo(() => {
    const status = String(searchParams.get("status") ?? "").toUpperCase();

    return MANUAL_ATTENDANCE_STATUSES.includes(status as ManualAttendanceStatus)
      ? (status as ManualAttendanceStatus)
      : "";
  }, [searchParams]);
  const [status, setStatus] = useState<ManualAttendanceStatus | "">(initialStatus);
  const [validationError, setValidationError] = useState<string | null>(null);
  const updateMutation = useMutation({
    mutationFn: () =>
      manualAttendanceApi.update(attendanceId, status as ManualAttendanceStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: manualAttendanceKeys.all });
      toast({
        title: "Attendance updated",
        description: "The attendance status has been changed.",
      });
      router.back();
    },
  });

  function submit() {
    if (!status) {
      setValidationError("Status is required.");
      return;
    }

    setValidationError(null);
    updateMutation.mutate();
  }

  return (
    <DashboardLayout
      title="Edit Attendance"
      description="Update the status for a manual attendance record"
    >
      <div className="dashboard-page">
        {validationError || updateMutation.error ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>
              {validationError ??
                readManualAttendanceError(updateMutation.error, "Unable to update attendance.")}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">
                Attendance Record ID
              </p>
              <p className="mt-2 max-w-[520px] truncate text-[14px] font-semibold text-foreground">
                {attendanceId}
              </p>
            </div>

            <div className="max-w-[360px]">
              <ManualStatusSelect
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setValidationError(null);
                }}
              />
            </div>

            <Button
              type="button"
              className="rounded-lg"
              disabled={updateMutation.isPending}
              onClick={submit}
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Status"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
