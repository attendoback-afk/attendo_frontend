"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { classesApi, studentsApi } from "@/lib/api/services";
import type {
  ClassRecord,
  StudentRecord,
  AttendanceRecord,
} from "@/lib/api/types";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function StudentDetailsPage() {
  const params = useParams<{ id: string }>();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadStudent() {
      setLoading(true);
      setError(null);
      try {
        const [record, classRecords, attendanceRecords] = await Promise.all([
          studentsApi.get(studentId),
          classesApi.list(),
          studentsApi.attendance(studentId).catch(() => []),
        ]);
        if (!active) return;
        setStudent(record);
        setClasses(classRecords);
        setAttendance(attendanceRecords);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load student.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    if (studentId) void loadStudent();
    return () => {
      active = false;
    };
  }, [studentId]);

  const className =
    classes.find((item) => item.id === student?.classId)?.name ??
    student?.class?.name ??
    "N/A";

  return (
    <DashboardLayout
      title="Student Details"
      description="Review the selected student record"
      action={
        student ? (
          <Button asChild className="rounded-xl">
            <Link href={`/students/${student.userId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Student
            </Link>
          </Button>
        ) : null
      }
    >
      <Card className="dashboard-panel">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading student details...
            </p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : student ? (
            <div className="grid gap-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Full Name" value={student.user.fullName} />
                <Field label="Email" value={student.user.email} />
                <Field label="Student Code" value={student.studentCode} />
                <Field label="Class" value={className} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Student not found.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-[18px] font-semibold">{value}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-[18px] font-semibold">{value}</p>
    </div>
  );
}
