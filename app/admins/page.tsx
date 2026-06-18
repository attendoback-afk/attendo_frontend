"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SoftStatusBadge } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { staffApi } from "@/lib/api/services";
import type { StaffRecord } from "@/lib/api/types";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setAdmins] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<StaffRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadAdmins() {
      setLoading(true);
      setError(null);

      try {
        const records = await staffApi.list();
        if (active) {
          setAdmins(records);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load admins.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAdmins();
    return () => {
      active = false;
    };
  }, []);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return admins;
    return admins.filter((admin) =>
      [admin.fullName, admin.email, admin.role].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [admins, searchQuery]);

  const handleDelete = async () => {
    if (!adminToDelete) return;
    setDeletingId(adminToDelete.id);
    try {
      await staffApi.delete(adminToDelete.id);
      setAdmins((current) =>
        current.filter((item) => item.id !== adminToDelete.id),
      );
      toast({
        title: "Admin deleted",
        description: "The admin account has been removed.",
      });
      setAdminToDelete(null);
    } catch (deleteError) {
      toast({
        title: "Unable to delete admin",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Admin Management"
      description="Manage manager, professor, and assistant accounts"
      action={
        <Link href="/admins/create">
          <PageActionButton icon={Plus}>Add Admin</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admins by name, email, or role..."
            className="h-11 rounded-xl pl-14"
          />
        </div>

        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="w-[170px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No admins found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.userId}>
                      <TableCell className="font-medium">
                        {admin?.user?.fullName}
                      </TableCell>
                      <TableCell>{admin?.user?.email}</TableCell>
                      <TableCell>
                        <SoftStatusBadge
                          tone={
                            admin.role?.name === "MANAGER" ? "lavender" : "blue"
                          }
                        >
                          {admin.role?.name}
                        </SoftStatusBadge>
                      </TableCell>
                      <TableCell>
                        {formatDate(admin.createdAt ?? admin.createdDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg"
                          >
                            <Link href={`/admins/${admin.userId}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg"
                          >
                            <Link href={`/admins/${admin.userId}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => setAdminToDelete(admin)}
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
        open={Boolean(adminToDelete)}
        onOpenChange={(open) => !open && setAdminToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              {adminToDelete
                ? `Are you sure you want to delete ${adminToDelete.fullName}?`
                : "Are you sure you want to delete this admin?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg"
              onClick={handleDelete}
              disabled={Boolean(deletingId)}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
