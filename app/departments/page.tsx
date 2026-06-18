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
import { departmentsApi } from "@/lib/api/services";
import type { DepartmentRecord } from "@/lib/api/types";

const PAGE_SIZE = 6;

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatDate(value: string | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [departmentToDelete, setDepartmentToDelete] = useState<DepartmentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      setLoading(true);
      setError(null);

      try {
        const records = await departmentsApi.list();

        if (active) {
          setDepartments(records);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load departments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      active = false;
    };
  }, []);

  const filteredDepartments = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.description].some((value) =>
        normalize(value).includes(query),
      ),
    );
  }, [departments, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!departmentToDelete) {
      return;
    }

    try {
      setDeleting(true);
      await departmentsApi.delete(departmentToDelete.id);
      setDepartments((current) => current.filter((item) => item.id !== departmentToDelete.id));
      toast({ title: "Department deleted", description: "The department has been removed." });
      setDepartmentToDelete(null);
    } catch (deleteError) {
      toast({
        title: "Unable to delete department",
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
      title="Department Management"
      description="Create, update, and manage academic departments"
      action={
        <Link href="/departments/create">
          <PageActionButton icon={Plus}>Add Department</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search departments by name or description..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <Card className="dashboard-panel gap-0 overflow-x-auto py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="w-[170px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading departments...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No departments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium text-[#6f6a7e]">
                        {department.name}
                      </TableCell>
                      <TableCell>{department.description ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(department.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/departments/${department.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View department</span>
                            </Link>
                          </Button>
                          <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/departments/${department.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit department</span>
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                            onClick={() => setDepartmentToDelete(department)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete department</span>
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
            Showing {filteredDepartments.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredDepartments.length)} of{" "}
            {filteredDepartments.length} departments
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
        open={Boolean(departmentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setDepartmentToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              {departmentToDelete
                ? `Are you sure you want to delete ${departmentToDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this department?"}
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
