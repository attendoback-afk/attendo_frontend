"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton, SearchInput } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SoftStatusBadge } from "@/components/dashboard-kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { classesApi, modulesApi, roomsApi, sessionsApi } from "@/lib/api/services";
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_VALUES,
  type ClassRecord,
  type ModuleRecord,
  type RoomRecord,
  type SessionRecord,
} from "@/lib/api/types";

const PAGE_SIZE = 6;

function labelForDay(day: number) {
  return DAY_OF_WEEK_LABELS[day as keyof typeof DAY_OF_WEEK_LABELS] ?? String(day);
}

function parseTime(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0));
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(Date.UTC(1970, 0, 1, 0, 0));
  }

  return date;
}

function formatSessionTime(value: string) {
  const date = parseTime(value);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function formatDuration(startTime: string, endTime: string) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const diffMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

  if (diffMinutes === 0) {
    return "0m";
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return [hours ? `${hours}h` : null, minutes ? `${minutes}m` : null].filter(Boolean).join(" ");
}

function buildEntityLabel(record: ClassRecord | ModuleRecord | RoomRecord | null | undefined) {
  if (!record) {
    return "";
  }

  if ("code" in record && record.code) {
    return `${record.code} - ${record.name}`;
  }

  return record.name;
}

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sessionToDelete, setSessionToDelete] = useState<SessionRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [sessionRecords, classRecords, moduleRecords, roomRecords] = await Promise.all([
          sessionsApi.list(),
          classesApi.list(),
          modulesApi.list(),
          roomsApi.list(),
        ]);

        if (!active) {
          return;
        }

        setSessions(sessionRecords);
        setClasses(classRecords);
        setModules(moduleRecords);
        setRooms(roomRecords);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load sessions.");
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

  const classMap = useMemo(() => new Map(classes.map((item) => [item.id, item])), [classes]);
  const moduleMap = useMemo(() => new Map(modules.map((item) => [item.id, item])), [modules]);
  const roomMap = useMemo(() => new Map(rooms.map((item) => [item.id, item])), [rooms]);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      if (classFilter !== "all" && session.classId !== classFilter) return false;
      if (moduleFilter !== "all" && session.moduleId !== moduleFilter) return false;
      if (roomFilter !== "all" && session.roomId !== roomFilter) return false;
      if (dayFilter !== "all" && session.dayOfWeek !== Number(dayFilter)) return false;

      if (!query) return true;

      const classLabel = buildEntityLabel(classMap.get(session.classId));
      const moduleLabel = buildEntityLabel(moduleMap.get(session.moduleId));
      const roomLabel = buildEntityLabel(roomMap.get(session.roomId));

      return [
        classLabel,
        moduleLabel,
        roomLabel,
        session.dayOfWeek,
        session.startTime,
        session.endTime,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [classFilter, classMap, dayFilter, moduleFilter, modules, roomFilter, roomMap, searchQuery, sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, classFilter, moduleFilter, roomFilter, dayFilter]);

  const handleDelete = async () => {
    if (!sessionToDelete) {
      return;
    }

    await sessionsApi.delete(sessionToDelete.id);
    setSessions((current) => current.filter((item) => item.id !== sessionToDelete.id));
    toast({ title: "Session deleted", description: "The session has been removed." });
    setSessionToDelete(null);
  };

  return (
    <DashboardLayout
      title="Sessions Management"
      description="Schedule, review, and maintain session records"
      action={
        <Link href="/sessions/create">
          <PageActionButton icon={Plus}>Add Session</PageActionButton>
        </Link>
      }
    >
      <div className="dashboard-page">
        <SearchInput
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {buildEntityLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {buildEntityLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {buildEntityLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {DAY_OF_WEEK_VALUES.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {labelForDay(day)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="dashboard-panel gap-0 overflow-x-auto py-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#fcfbff]">
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[170px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session) => {
                    const classRecord = classMap.get(session.classId);
                    const moduleRecord = moduleMap.get(session.moduleId);
                    const roomRecord = roomMap.get(session.roomId);

                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium text-[#6f6a7e]">
                          {buildEntityLabel(classRecord)}
                        </TableCell>
                        <TableCell>{buildEntityLabel(moduleRecord)}</TableCell>
                        <TableCell>{buildEntityLabel(roomRecord)}</TableCell>
                        <TableCell>{labelForDay(session.dayOfWeek)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">
                              {formatSessionTime(session.startTime)} - {formatSessionTime(session.endTime)}
                            </span>
                            <SoftStatusBadge tone="blue" className="w-fit">
                              {formatDuration(session.startTime, session.endTime)} duration
                            </SoftStatusBadge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                              <Link href={`/sessions/${session.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View session</span>
                              </Link>
                            </Button>
                            <Button asChild type="button" variant="ghost" size="icon-sm" className="rounded-lg">
                              <Link href={`/sessions/${session.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit session</span>
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="rounded-lg text-[#ff7f89] hover:text-[#ff7f89]"
                              onClick={() => setSessionToDelete(session)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete session</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[13px] text-muted-foreground">
            Showing {filteredSessions.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, filteredSessions.length)} of {filteredSessions.length} sessions
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
        open={Boolean(sessionToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setSessionToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToDelete
                ? `Are you sure you want to delete the session on ${labelForDay(sessionToDelete.dayOfWeek)}? This action cannot be undone.`
                : "Are you sure you want to delete this session?"}
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
