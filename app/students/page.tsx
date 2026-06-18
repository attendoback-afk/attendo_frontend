"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput, SoftStatusBadge } from "@/components/dashboard-kit";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { StudentEditDialog } from "@/components/students/student-edit-dialog";
import type { StudentFormValues } from "@/types/entity-form-values";
import type { StudentRecord } from "@/lib/people-store";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);
  const { toast } = useToast();
  const { students, updateStudent, deleteStudent } = useStudents();

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEditSubmit = async (values: StudentFormValues) => {
    if (!editingStudent) {
      return;
    }

    const normalizedEmail = values.email.trim().toLowerCase();
    const normalizedCode = values.studentCode.trim();
    const emailTaken = students.some(
      (student) => student.id !== editingStudent.id && student.email.toLowerCase() === normalizedEmail,
    );
    const codeTaken = students.some(
      (student) =>
        student.id !== editingStudent.id &&
        student.studentCode.toLowerCase() === normalizedCode.toLowerCase(),
    );

    if (emailTaken) {
      throw new Error("Email already exists for another student.");
    }

    if (codeTaken) {
      throw new Error("Student code already exists for another student.");
    }

    updateStudent(editingStudent.id, {
      fullName: values.fullName.trim(),
      email: normalizedEmail,
      password: values.password,
      studentCode: normalizedCode,
      active: values.active,
    });

    toast({
      title: "Student updated",
      description: "The student details were saved successfully.",
    });
  };

  const handleDelete = () => {
    if (!studentToDelete) {
      return;
    }

    deleteStudent(studentToDelete.id);
    toast({
      title: "Student deleted",
      description: "The student record has been removed.",
    });
    setStudentToDelete(null);
  };

  return (
    <DashboardLayout
      title="Student Management"
      description="Add, edit, and manage student records"
      action={
        <Link href="/students/new">
          <PageActionButton icon={Plus}>Add Student</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search Students by name, ID, or class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Year..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Department..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">Information Technology</SelectItem>
              <SelectItem value="electrical">Electrical Technology</SelectItem>
              <SelectItem value="mechanical">Mechanical Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="dashboard-panel overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px] text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-[#6f6a7e]">{student.fullName}</TableCell>
                  <TableCell>{student.studentCode}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <SoftStatusBadge tone={student.active ? "success" : "danger"}>
                      {student.active ? "Active" : "Inactive"}
                    </SoftStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        onClick={() => setEditingStudent(student)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit student</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                        onClick={() => setStudentToDelete(student)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete student</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentEditDialog
        student={editingStudent}
        open={Boolean(editingStudent)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingStudent(null);
          }
        }}
        onSubmit={handleEditSubmit}
      />

      <AlertDialog
        open={Boolean(studentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setStudentToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToDelete
                ? `Are you sure you want to delete ${studentToDelete.fullName}? This action cannot be undone.`
                : "Are you sure you want to delete this student?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
