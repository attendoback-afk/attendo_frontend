"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  ManualStatusSelect,
  studentInitials,
} from "@/components/manual-attendance/manual-attendance-widgets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type SelectionMap = Record<string, ManualAttendanceStatus | undefined>;

function applyStatusToAll(
  studentIds: string[],
  status: ManualAttendanceStatus | undefined,
) {
  return studentIds.reduce<SelectionMap>((next, studentId) => {
    next[studentId] = status;
    return next;
  }, {});
}

export default function BulkAttendanceView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const referenceQuery = useManualAttendanceReferenceData();
  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState<number | "">("");
  const [selections, setSelections] = useState<SelectionMap>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const studentsQuery = useStudentsForClass(classId);
  const studentIds = useMemo(
    () =>
      (studentsQuery.data ?? [])
        .map((student) => {
          const typedStudent = student as { userId?: string | number };
          const rawId = typedStudent.userId ?? entityId(student);
          return rawId ? String(rawId) : "";
        })
        .filter((studentId) => Boolean(studentId)),
    [studentsQuery.data],
  );
  const selectedRows = useMemo(
    () =>
      Object.entries(selections)
        .map(([studentId, status]) => ({
          studentId: Number(studentId),
          status,
        }))
        .filter(
          (entry): entry is { studentId: number; status: ManualAttendanceStatus } =>
            Boolean(entry.status) && !Number.isNaN(entry.studentId),
        ),
    [selections],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      manualAttendanceApi.bulkCreate({
        sessionId: sessionId ?? "",
        date: new Date().toISOString(),
        attendance: selectedRows.map(({ studentId, status }) => ({
          studentId,
          status,
        })),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: manualAttendanceKeys.all });
      toast({
        title: "Bulk attendance saved",
        description: "The selected attendance records have been marked.",
      });
      router.back();
    },
  });

  function save() {
    if (!classId) {
      setValidationError("Class is required.");
      return;
    }

    if (!sessionId) {
      setValidationError("Session is required.");
      return;
    }

    if (selectedRows.length === 0) {
      setValidationError("Select at least one student status.");
      return;
    }

    setValidationError(null);
    saveMutation.mutate();
  }

  const error = referenceQuery.error ?? studentsQuery.error ?? saveMutation.error;

  return (
    <DashboardLayout
      title="Bulk Attendance"
      description="Mark attendance for a whole class"
    >
      <div className="dashboard-page">
        {validationError || error ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>
              {validationError ??
                readManualAttendanceError(error, "Unable to save bulk attendance.")}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="grid gap-3 p-5 md:grid-cols-2">
            <Select
              value={classId}
              onValueChange={(value) => {
                setClassId(value);
                setSelections({});
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
                    {[session.module?.name, session.class?.name, session.startTime]
                      .filter(Boolean)
                      .join(" - ") || session.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={studentIds.length === 0}
            onClick={() => setSelections(applyStatusToAll(studentIds, "PRESENT"))}
          >
            Mark All Present
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={studentIds.length === 0}
            onClick={() => setSelections(applyStatusToAll(studentIds, "ABSENT"))}
          >
            Mark All Absent
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            disabled={studentIds.length === 0}
            onClick={() => setSelections(applyStatusToAll(studentIds, "LATE"))}
          >
            Mark All Late
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-lg"
            onClick={() => setSelections({})}
          >
            Clear Selection
          </Button>
        </div>

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="space-y-3 p-5">
            {studentsQuery.isLoading ? (
              <p className="py-8 text-center text-muted-foreground">Loading students...</p>
            ) : (studentsQuery.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Select a class to load students.
              </p>
            ) : (
              (studentsQuery.data ?? [])
                .map((student, index) => {
                  const typedStudent = student as {
                    userId?: string | number;
                    studentCode?: string;
                    email?: string;
                  };
                  const name =
                    student.fullName ??
                    student.name ??
                    typedStudent.studentCode ??
                    typedStudent.email ??
                    `Student ${index + 1}`;
                  const rawId = typedStudent.userId ?? entityId(student);
                  const id = rawId ? String(rawId) : `student-${index}`;

                  return { student, id, name };
                })
                .map(({ student, id, name }) => (
                  <div
                    key={id}
                    className="grid gap-3 rounded-lg border border-border bg-[#fcfbff] p-3 md:grid-cols-[1fr_220px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border bg-[#eef4ff]">
                        <AvatarFallback className="bg-[#eef4ff] text-[13px] font-semibold text-[#6578ad]">
                          {studentInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-foreground">
                          {name}
                        </p>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {student.studentCode}
                        </p>
                      </div>
                    </div>
                    <ManualStatusSelect
                      value={selections[id]}
                      onValueChange={(status) =>
                        setSelections((current) => ({ ...current, [id]: status }))
                      }
                    />
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="button"
            className="rounded-lg"
            disabled={saveMutation.isPending}
            onClick={save}
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
