"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ManualStatusSelect } from "@/components/manual-attendance/manual-attendance-widgets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  manualAttendanceKeys,
  readManualAttendanceError,
  useManualAttendanceReferenceData,
  useStudentsForClass,
} from "@/hooks/useManualAttendance";
import { manualAttendanceApi } from "@/services/manual-attendance";
import { entityId } from "@/lib/api/client";
import type { ManualAttendanceStatus } from "@/types/manual-attendance";

function sessionLabel(record: { id: string | number; module?: { name?: string }; class?: { name?: string }; startTime?: string }) {
  return [record.module?.name, record.class?.name, record.startTime]
    .filter(Boolean)
    .join(" - ") || String(record.id);
}

export default function MarkAttendanceView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const referenceQuery = useManualAttendanceReferenceData();
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sessionId, setSessionId] = useState<number | "">("");
  const [status, setStatus] = useState<ManualAttendanceStatus | "">("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const studentsQuery = useStudentsForClass(classId);
  const studentOptions = useMemo(
    () =>
      (studentsQuery.data ?? [])
        .map((student, index) => {
          const typedStudent = student as {
            userId?: string | number;
            studentCode?: string;
            email?: string;
          };
          const rawId = typedStudent.userId ?? entityId(student);
          const id = rawId ? String(rawId) : "";

          return {
            id,
            label:
              student.fullName ??
              student.name ??
              typedStudent.studentCode ??
              typedStudent.email ??
              `Student ${index + 1}`,
          };
        })
        .filter((option) => option.id),
    [studentsQuery.data],
  );
  const selectedSession = useMemo(
    () =>
      (referenceQuery.data?.sessions ?? []).find(
        (session) => String(session.id) === sessionId,
      ),
    [referenceQuery.data?.sessions, sessionId],
  );

  const markMutation = useMutation({
    mutationFn: () =>
      manualAttendanceApi.create({
        studentId: studentId ?? "",
        sessionId: sessionId ?? "",
        status: status as ManualAttendanceStatus,
        date: new Date().toISOString(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: manualAttendanceKeys.all });
      toast({
        title: "Attendance marked",
        description: "The manual attendance record has been saved.",
      });
      router.back();
    },
  });

  function submit() {
    if (!studentId) {
      setValidationError("Student is required.");
      return;
    }

    if (!sessionId) {
      setValidationError("Session is required.");
      return;
    }

    if (!status) {
      setValidationError("Status is required.");
      return;
    }

    setValidationError(null);
    markMutation.mutate();
  }

  const error = referenceQuery.error ?? studentsQuery.error ?? markMutation.error;

  return (
    <DashboardLayout
      title="Mark Attendance"
      description="Create one manual attendance record"
    >
      <div className="dashboard-page">
        {validationError || error ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>
              {validationError ??
                readManualAttendanceError(error, "Unable to mark attendance.")}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <Select
              value={classId}
              onValueChange={(value) => {
                setClassId(value);
                setStudentId("");
                setValidationError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.classes ?? []).map((classRecord) => (
                  <SelectItem key={classRecord.id} value={String(classRecord.id)}>
                    {classRecord.code ? `${classRecord.code} - ${classRecord.name}` : classRecord.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={studentId}
              onValueChange={(value) => {
                setStudentId(value);
                setValidationError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={studentsQuery.isLoading ? "Loading students..." : "Select student"} />
              </SelectTrigger>
              <SelectContent>
                {studentOptions.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sessionId ? String(sessionId) : ""}
              onValueChange={(value) => {
                setSessionId(value ? Number(value) : "");
                setValidationError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.sessions ?? []).map((session) => (
                  <SelectItem key={session.id} value={String(session.id)}>
                    {sessionLabel(session)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ManualStatusSelect
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setValidationError(null);
              }}
            />

            <div className="md:col-span-2">
              <Button
                type="button"
                className="rounded-lg"
                disabled={markMutation.isPending}
                onClick={submit}
              >
                <CheckCircle2 className="h-4 w-4" />
                {markMutation.isPending ? "Saving..." : "Mark Attendance"}
              </Button>
            </div>

            {selectedSession ? (
              <p className="md:col-span-2 text-[13px] text-muted-foreground">
                Selected session: {sessionLabel(selectedSession)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
