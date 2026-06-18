"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { roomsApi } from "@/lib/api/services";
import type { RoomRecord } from "@/lib/api/types";

const PAGE_SIZE = 6;

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const data = await roomsApi.list();
        setRooms(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load rooms";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [toast]);

  useEffect(() => {
    const filtered = rooms.filter((room) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        room.name.toLowerCase().includes(searchLower) ||
        (room.building?.toLowerCase().includes(searchLower) || false)
      );
    });
    setFilteredRooms(filtered);
    setPage(0);
  }, [searchTerm, rooms]);

  const handleDelete = async () => {
    if (!roomToDelete) return;

    try {
      setDeleting(true);
      await roomsApi.delete(roomToDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
      toast({
        title: "Room deleted",
        description: "Room has been deleted successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete room";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE);
  const startIdx = page * PAGE_SIZE;
  const paginatedRooms = filteredRooms.slice(startIdx, startIdx + PAGE_SIZE);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage room details and information
            </p>
          </div>
          <Button asChild>
            <Link href="/rooms/create" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Room
            </Link>
          </Button>
        </div>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle>Room List</CardTitle>
            <div className="mt-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent>
            {paginatedRooms.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {rooms.length === 0
                  ? "No rooms found. Create one to get started."
                  : "No results match your search."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Name</TableHead>
                        <TableHead className="w-20 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Link href={`/rooms/${room.id}/edit`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setRoomToDelete(room);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage(Math.max(0, page - 1))}
                        className="rounded-lg"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        className="rounded-lg"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the room "{roomToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
