"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminEditDialog } from "@/components/admins/admin-edit-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput, SoftStatusBadge } from "@/components/dashboard-kit";
import { useAdmins } from "@/hooks/use-admins";
import { useToast } from "@/hooks/use-toast";
import type { AdminFormValues } from "@/types/entity-form-values";
import type { AdminRecord } from "@/lib/people-store";
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

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminRecord | null>(null);
  const { toast } = useToast();
  const { admins, updateAdmin, deleteAdmin } = useAdmins();

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEditSubmit = async (values: AdminFormValues) => {
    if (!editingAdmin) {
      return;
    }

    const normalizedEmail = values.email.trim().toLowerCase();
    const emailTaken = admins.some(
      (admin) => admin.id !== editingAdmin.id && admin.email.toLowerCase() === normalizedEmail,
    );

    if (emailTaken) {
      throw new Error("Email already exists for another admin.");
    }

    updateAdmin(editingAdmin.id, {
      fullName: values.fullName.trim(),
      email: normalizedEmail,
      password: values.password,
      role: values.role,
      active: values.active,
    });

    toast({
      title: "Admin updated",
      description: "The admin details were saved successfully.",
    });
  };

  const handleDelete = () => {
    if (!adminToDelete) {
      return;
    }

    deleteAdmin(adminToDelete.id);
    toast({
      title: "Admin deleted",
      description: "The admin account has been removed.",
    });
    setAdminToDelete(null);
  };

  return (
    <DashboardLayout
      title="Admin Management"
      description="Manage doctors and department managers"
      action={
        <Link href="/admins/new">
          <PageActionButton icon={Plus}>Add Admin</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="dashboard-panel overflow-hidden">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px] text-right"> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium text-[#6f6a7e]">{admin.fullName}</TableCell>
                  <TableCell>
                    <SoftStatusBadge tone={admin.role === "manager" ? "lavender" : "blue"}>
                      {admin.role}
                    </SoftStatusBadge>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <SoftStatusBadge tone={admin.active ? "success" : "danger"}>
                      {admin.active ? "Active" : "Inactive"}
                    </SoftStatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg"
                        onClick={() => setEditingAdmin(admin)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit admin</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                        onClick={() => setAdminToDelete(admin)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete admin</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AdminEditDialog
        admin={editingAdmin}
        open={Boolean(editingAdmin)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAdmin(null);
          }
        }}
        onSubmit={handleEditSubmit}
      />

      <AlertDialog
        open={Boolean(adminToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setAdminToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              {adminToDelete
                ? `Are you sure you want to delete ${adminToDelete.fullName}? This action cannot be undone.`
                : "Are you sure you want to delete this admin?"}
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
