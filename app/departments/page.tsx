"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DepartmentEditDialog } from "@/components/departments/department-edit-dialog";
import { PageActionButton, SearchInput } from "@/components/dashboard-kit";
import { DashboardLayout } from "@/components/dashboard-layout";
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
import { useDepartments } from "@/hooks/use-departments";
import type { Department } from "@/lib/departments-store";
import type { DepartmentFormValues } from "@/types/entity-form-values";

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const { toast } = useToast();
  const { departments, updateDepartment, deleteDepartment } = useDepartments();

  const filteredDepartments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [departments, searchQuery]);

  const handleEditSubmit = async (values: DepartmentFormValues) => {
    if (!editingDepartment) {
      return;
    }

    updateDepartment(editingDepartment.id, values);
    toast({
      title: "Department updated",
      description: "The department details were saved successfully.",
    });
  };

  const handleDelete = () => {
    if (!departmentToDelete) {
      return;
    }

    deleteDepartment(departmentToDelete.id);
    toast({
      title: "Department deleted",
      description: "The department has been removed.",
    });
    setDepartmentToDelete(null);
  };

  return (
    <>
      <DashboardLayout
        title="Department Management"
        description="Organize and manage departments"
        action={
          <Link href="/departments/new">
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

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {filteredDepartments.map((department) => (
              <Card key={department.id} className="dashboard-panel gap-0 py-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f2ff]">
                      <Building2 className="h-6 w-6 text-[#958dc9]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        onClick={() => setEditingDepartment(department)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit department</span>
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
                  </div>
                  <div className="mt-4 min-w-0 flex-1">
                    <h3 className="text-[18px] font-semibold leading-8 tracking-[-0.02em] text-foreground">
                      {department.name}
                    </h3>
                    <p className="text-[14px] leading-6 text-muted-foreground">
                      {department.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>

      <DepartmentEditDialog
        department={editingDepartment}
        open={Boolean(editingDepartment)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDepartment(null);
          }
        }}
        onSubmit={handleEditSubmit}
      />

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
            <AlertDialogAction className="rounded-lg" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
