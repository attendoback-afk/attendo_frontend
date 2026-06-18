"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentForm } from "@/forms/student/student-form";
import { useToast } from "@/hooks/use-toast";
import { classesApi, studentsApi, attendanceApi } from "@/lib/api/services";
import type { ClassRecord } from "@/lib/api/types";

export default function CreateStudentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadClasses() {
      setLoading(true);
      setError(null);
      try {
        const records = await classesApi.list();
        if (active) setClasses(records);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load classes.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadClasses();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout
      title="Create Student"
      description="Add a new student account"
    >
      {loading ? (
        <div className="dashboard-panel p-6 text-sm text-muted-foreground">
          Loading classes...
        </div>
      ) : error ? (
        <div className="dashboard-panel p-6 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <StudentForm
          cancelHref="/students"
          classOptions={classes}
          onSubmit={async (values) => {
            const record = await studentsApi.create({
              fullName: values.fullName.trim(),
              email: values.email.trim().toLowerCase(),
              password: values.password,
              studentCode: values.studentCode.trim(),
              classId: values.classId,
            });

            toast({
              title: "Student created",
              description: "The student account has been saved.",
            });
            router.push("/students");
            router.refresh();
          }}
        />
      )}
    </DashboardLayout>
  );
}
