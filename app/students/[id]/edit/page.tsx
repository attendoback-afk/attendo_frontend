"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentForm } from "@/forms/student/student-form";
import { useToast } from "@/hooks/use-toast";
import { classesApi, studentsApi } from "@/lib/api/services";
import type { ClassRecord, StudentRecord } from "@/lib/api/types";

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [studentRecord, classRecords] = await Promise.all([
          studentsApi.get(studentId),
          classesApi.list(),
        ]);
        if (!active) return;
        setStudent(studentRecord);
        setClasses(classRecords);
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
    if (studentId) void loadData();
    return () => {
      active = false;
    };
  }, [studentId]);

  return (
    <DashboardLayout
      title="Edit Student"
      description="Update student account details"
    >
      {loading ? (
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading student...
        </div>
      ) : error ? (
        <div className="dashboard-panel p-6 text-sm text-destructive">
          {error}
        </div>
      ) : student ? (
        <StudentForm
          cancelHref={`/students/${student.userId}`}
          defaultValue={student}
          classOptions={classes}
          submitLabel="Save Changes"
          passwordOptional
          onSubmit={async (values) => {
            await studentsApi.update(student.userId, {
              fullName: values.fullName.trim(),
              email: values.email.trim().toLowerCase(),
              studentCode: values.studentCode.trim(),
              classId: values.classId,
              ...(values.password ? { password: values.password } : {}),
            });
            toast({
              title: "Student updated",
              description: "The student record has been saved.",
            });
            router.push(`/students/${student.userId}`);
            router.refresh();
          }}
        />
      ) : null}
    </DashboardLayout>
  );
}
