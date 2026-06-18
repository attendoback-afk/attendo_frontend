"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput } from "@/components/dashboard-kit";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { modulesApi } from "@/lib/api/services";
import type { ModuleRecord } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 6;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadModules() {
      setLoading(true);
      setError(null);

      try {
        const records = await modulesApi.list();

        if (active) {
          setModules(records);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load modules.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadModules();

    return () => {
      active = false;
    };
  }, []);

  const filteredModules = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) {
      return modules;
    }

    return modules.filter((module) =>
      [module.name, module.code, module.description ?? ""].some((value) =>
        normalize(value).includes(query),
      ),
    );
  }, [modules, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!moduleToDelete) {
      return;
    }

    await modulesApi.delete(moduleToDelete.id);
    setModules((current) => current.filter((item) => item.id !== moduleToDelete.id));
    toast({ title: "Module deleted", description: "The module has been removed." });
    setModuleToDelete(null);
  };

  return (
    <DashboardLayout
      title="Module Management"
      description="Create, update, and manage academic modules"
      action={
        <Link href="/modules/create">
          <PageActionButton icon={Plus}>Add Module</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search modules by name, code, or description..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <Card className="dashboard-panel gap-0 overflow-x-auto py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[170px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading modules...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No modules found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium text-[#6f6a7e]">{module.name}</TableCell>
                      <TableCell>{module.code}</TableCell>
                      <TableCell>{module.description ?? "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/modules/${module.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View module</span>
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon-sm" className="rounded-lg">
                            <Link href={`/modules/${module.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit module</span>
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                            onClick={() => setModuleToDelete(module)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete module</span>
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
            Showing {filteredModules.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredModules.length)} of {filteredModules.length} modules
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
        open={Boolean(moduleToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setModuleToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              {moduleToDelete
                ? `Are you sure you want to delete ${moduleToDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this module?"}
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
