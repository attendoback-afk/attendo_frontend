"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput } from "@/components/dashboard-kit";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { classesApi, departmentsApi } from "@/lib/api/services";
import type { ClassRecord, DepartmentRecord } from "@/lib/api/types";

const PAGE_SIZE = 6;

function normalize(value: string | number | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function formatDate(value: string | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function classCode(classRecord: ClassRecord) {
  return classRecord.classCode ?? classRecord.code ?? "N/A";
}

function departmentLabel(classRecord: ClassRecord, departments: Map<string, DepartmentRecord>) {
  if (classRecord.department) {
    return classRecord.department.name;
  }

  const departmentId = classRecord.departmentId ? String(classRecord.departmentId) : "";

  if (departmentId && departments.has(departmentId)) {
    const department = departments.get(departmentId);
    return department?.name ?? "N/A";
  }

  return "N/A";
}

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [classToDelete, setClassToDelete] = useState<ClassRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [classRecords, departmentRecords] = await Promise.all([
          classesApi.list(),
          departmentsApi.list(),
        ]);

        if (!active) {
          return;
        }

        setClasses(classRecords);
        setDepartments(departmentRecords);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load classes.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const departmentMap = useMemo(
    () => new Map(departments.map((department) => [department.id, department])),
    [departments],
  );

  const filteredClasses = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) {
      return classes;
    }

    return classes.filter((classRecord) =>
      [
        classRecord.name,
        classCode(classRecord),
        classRecord.year ?? classRecord.level,
        classRecord.description,
        departmentLabel(classRecord, departmentMap),
      ].some((value) => normalize(value).includes(query)),
    );
  }, [classes, departmentMap, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!classToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await classesApi.delete(classToDelete.id);
      setClasses((current) => current.filter((item) => item.id !== classToDelete.id));
      toast({ title: "Class deleted", description: "The class has been removed." });
      setClassToDelete(null);
    } catch (deleteError) {
      toast({
        title: "Unable to delete class",
        description:
          deleteError instanceof Error ? deleteError.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Class Management"
      description="Create, update, and manage classes"
      action={
        <Link href="/classes/create">
          <PageActionButton icon={Plus}>Add Class</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search classes by name, code, department, or description..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <Card className="dashboard-panel gap-0 overflow-x-auto py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="w-[170px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      Loading classes...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No classes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClasses.map((classRecord) => (
                    <TableRow key={classRecord.id}>
                      <TableCell className="font-medium text-[#6f6a7e]">
                        {classRecord.name}
                      </TableCell>
                      <TableCell>{classCode(classRecord)}</TableCell>
                      <TableCell>{departmentLabel(classRecord, departmentMap)}</TableCell>
                      <TableCell>{classRecord.year ?? classRecord.level ?? "N/A"}</TableCell>
                      <TableCell>{classRecord.description ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(classRecord.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/classes/${classRecord.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View class</span>
                            </Link>
                          </Button>
                          <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/classes/${classRecord.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit class</span>
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                            onClick={() => setClassToDelete(classRecord)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete class</span>
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

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[13px] text-muted-foreground">
            Showing {filteredClasses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredClasses.length)} of {filteredClasses.length} classes
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <div className="rounded-xl border border-border bg-white px-4 py-2 text-[14px] text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={Boolean(classToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setClassToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              {classToDelete
                ? `Are you sure you want to delete ${classToDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this class?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
