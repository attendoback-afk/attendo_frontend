"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SoftStatusBadge } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { classesApi, studentsApi } from "@/lib/api/services";
import type { ClassRecord, StudentRecord } from "@/lib/api/types";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [studentRecords, classRecords] = await Promise.all([
          studentsApi.list(),
          classesApi.list(),
        ]);
        if (active) {
          setStudents(studentRecords);
          setClasses(classRecords);
        }
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load students.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const classMap = useMemo(
    () => new Map(classes.map((item) => [item.id, item])),
    [classes],
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const className =
        classMap.get(student.classId)?.name ?? student.class?.name ?? "";
      const matchesQuery =
        !query ||
        [student.fullName, student.email, student.studentCode, className].some(
          (value) => value?.toLowerCase().includes(query),
        );
      const matchesClass = !classFilter || student.classId === classFilter;
      return matchesQuery && matchesClass;
    });
  }, [classFilter, classMap, searchQuery, students]);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await studentsApi.delete(studentToDelete.userId);
      setStudents((current) =>
        current.filter((item) => item.userId !== studentToDelete.userId),
      );
      toast({
        title: "Student deleted",
        description: "The student has been removed.",
      });
      setStudentToDelete(null);
    } catch (deleteError) {
      toast({
        title: "Unable to delete student",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Student Management"
      description="Create, update, view, and import student accounts"
      action={
        <div className="flex flex-wrap gap-2">
          <Link href="/students/import">
            <PageActionButton variant="outline" icon={Upload}>
              Import Students
            </PageActionButton>
          </Link>
          <Link href="/students/create">
            <PageActionButton icon={Plus}>Add Student</PageActionButton>
          </Link>
        </div>
      }
    >
      <div className="dashboard-page">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, email, code, or class..."
              className="h-11 rounded-xl pl-14"
            />
          </div>
          <Input
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Filter by class ID..."
            className="h-11 rounded-xl"
          />
        </div>

        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student Code</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="w-[170px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell className="font-medium">
                        {student.user.fullName}
                      </TableCell>
                      <TableCell>{student.user.email}</TableCell>
                      <TableCell>{student.studentCode}</TableCell>
                      <TableCell>
                        {classMap.get(student.classId)?.name ??
                          student.class?.name ??
                          "N/A"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg"
                          >
                            <Link href={`/students/${student.userId}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg"
                          >
                            <Link href={`/students/${student.userId}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => setStudentToDelete(student)}
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      <AlertDialog
        open={Boolean(studentToDelete)}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToDelete
                ? `Are you sure you want to delete ${studentToDelete.fullName}?`
                : "Are you sure you want to delete this student?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
