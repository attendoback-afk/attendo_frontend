"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classesApi, departmentsApi, sessionsApi } from "@/lib/api/services";
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_VALUES,
  type ClassRecord,
  type DepartmentRecord,
  type SessionRecord,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

type ScheduleCell = {
  key: string;
  sessions: SessionRecord[];
};

const DAY_COLUMNS = DAY_OF_WEEK_VALUES;

function labelForDay(day: number) {
  return DAY_OF_WEEK_LABELS[day as keyof typeof DAY_OF_WEEK_LABELS] ?? String(day);
}

function parseTimeValue(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    return { hours, minutes };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { hours: 0, minutes: 0 };
  }

  return { hours: date.getUTCHours(), minutes: date.getUTCMinutes() };
}

function formatTime(value: string) {
  const { hours, minutes } = parseTimeValue(value);
  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function timeKey(value: string) {
  const { hours, minutes } = parseTimeValue(value);
  return hours * 60 + minutes;
}

function timeTextKey(value: string) {
  const { hours, minutes } = parseTimeValue(value);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildTimeSlots(sessions: SessionRecord[]) {
  const slots = new Set<number>();

  sessions.forEach((session) => {
    slots.add(timeKey(session.startTime));
  });

  return [...slots]
    .sort((left, right) => left - right)
    .map((minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    });
}

function formatDuration(startTime: string, endTime: string) {
  const start = timeKey(startTime);
  const end = timeKey(endTime);
  const diffMinutes = Math.max(0, end - start);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return [hours ? `${hours}h` : null, minutes ? `${minutes}m` : null].filter(Boolean).join(" ") || "0m";
}

function entityLabel(record: ClassRecord | null | undefined) {
  if (!record) return "Unknown class";
  return record.name;
}

function departmentLabel(record: ClassRecord | null | undefined, departments: Map<string, DepartmentRecord>) {
  if (!record) return "";
  const departmentId = record.departmentId ? String(record.departmentId) : "";
  return departmentId && departments.has(departmentId) ? departments.get(departmentId)?.name ?? "" : "";
}

function roomLabel(session: SessionRecord) {
  return session.room?.name ?? "N/A";
}

function moduleLabel(session: SessionRecord) {
  return session.module?.name ?? "N/A";
}

function professorLabel(session: SessionRecord) {
  const anySession = session as SessionRecord & {
    professorName?: string;
    professor?: { name?: string; fullName?: string };
    staff?: { name?: string; fullName?: string };
  };

  return (
    anySession.professorName ??
    anySession.professor?.fullName ??
    anySession.professor?.name ??
    anySession.staff?.fullName ??
    anySession.staff?.name ??
    "N/A"
  );
}

export default function SchedulesPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFilters() {
      try {
        const [classRecords, departmentRecords] = await Promise.all([classesApi.list(), departmentsApi.list()]);
        if (!active) return;
        setClasses(classRecords);
        setDepartments(departmentRecords);
        setSelectedClassId((current) => current || String(classRecords[0]?.id ?? ""));
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load schedule filters.");
        }
      }
    }

    void loadFilters();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSchedule() {
      if (!selectedClassId) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const records = await sessionsApi.listByClass(selectedClassId);
        if (!active) return;
        setSessions(records);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load schedule.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSchedule();

    return () => {
      active = false;
    };
  }, [selectedClassId]);

  const classMap = useMemo(() => new Map(classes.map((item) => [String(item.id), item])), [classes]);
  const departmentMap = useMemo(
    () => new Map(departments.map((item) => [String(item.id), item])),
    [departments],
  );

  const visibleClasses = useMemo(() => {
    if (selectedDepartmentId === "all") {
      return classes;
    }

    return classes.filter((item) => String(item.departmentId ?? "") === selectedDepartmentId);
  }, [classes, selectedDepartmentId]);

  useEffect(() => {
    if (selectedClassId && !visibleClasses.some((item) => String(item.id) === selectedClassId)) {
      setSelectedClassId(String(visibleClasses[0]?.id ?? ""));
    }
  }, [selectedClassId, visibleClasses]);

  const selectedClass = classMap.get(selectedClassId);
  const timeSlots = useMemo(() => buildTimeSlots(sessions), [sessions]);

  const rows = useMemo(() => {
    const grouped = new Map<string, ScheduleCell[]>(
      timeSlots.map((slot) => [slot, DAY_COLUMNS.map((day) => ({ key: `${slot}-${day}`, sessions: [] }))]),
    );

    sessions.forEach((session) => {
      const slotKey = timeTextKey(session.startTime);
      const cellRow = grouped.get(slotKey);
      if (!cellRow) return;
      const dayIndex = DAY_COLUMNS.indexOf(session.dayOfWeek);
      if (dayIndex < 0) return;
      cellRow[dayIndex].sessions.push(session);
    });

    return [...grouped.entries()];
  }, [sessions, timeSlots]);

  return (
    <DashboardLayout
      title="Schedule Management"
      description="Weekly timetable visualization from live session data"
    >
      <div className="dashboard-page">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="dashboard-field-label">Department</label>
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Optional department filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="dashboard-field-label">Class</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {visibleClasses.map((classRecord) => (
                  <SelectItem key={classRecord.id} value={String(classRecord.id)}>
                    {classRecord.code ? `${classRecord.code} - ${classRecord.name}` : classRecord.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[110px_repeat(7,minmax(140px,1fr))] border-b border-border bg-[#fcfbff]">
                  <div className="px-4 py-4 text-sm font-semibold text-foreground">Time</div>
                  {DAY_COLUMNS.map((day) => (
                    <div key={day} className="px-4 py-4 text-center text-sm font-semibold text-foreground">
                      {labelForDay(day)}
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="divide-y divide-border">
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-[110px_repeat(7,minmax(140px,1fr))] min-h-[108px]"
                      >
                        <div className="border-r border-border p-4">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="mt-2 h-4 w-12" />
                        </div>
                        {DAY_COLUMNS.map((day) => (
                          <div key={`${rowIndex}-${day}`} className="border-r border-border p-3 last:border-r-0">
                            <Skeleton className="h-full min-h-[80px] rounded-xl" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-sm text-destructive">{error}</div>
                ) : !selectedClass || sessions.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/60" />
                    <div>
                      <p className="text-base font-semibold text-foreground">No schedule available</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedClass
                          ? "This class does not have any sessions yet."
                          : "Select a class to view its weekly timetable."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {rows.map(([slot, dayCells]) => (
                      <div key={slot} className="grid grid-cols-[110px_repeat(7,minmax(140px,1fr))] min-h-[108px]">
                        <div className="border-r border-border p-4">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Clock3 className="mt-0.5 h-4 w-4" />
                            <div>
                              <div className="font-medium text-foreground">{formatTime(slot)}</div>
                              <div className="text-xs text-muted-foreground">Start</div>
                            </div>
                          </div>
                        </div>

                        {dayCells.map((cell) => (
                          <div key={cell.key} className="border-r border-border p-3 last:border-r-0">
                            <div className="flex min-h-[84px] flex-col gap-2">
                              {cell.sessions.map((session) => {
                                const classRecord = classMap.get(String(session.classId));
                                return (
                                  <Card
                                    key={session.id}
                                    className={cn(
                                      "rounded-xl border border-[#dbe5ff] bg-[#f4f7ff] py-0 shadow-none",
                                      cell.sessions.length > 1 && "w-full",
                                    )}
                                  >
                                    <CardContent className="space-y-2 p-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="text-sm font-semibold leading-5 text-foreground">
                                            {moduleLabel(session)}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {entityLabel(classRecord)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="grid gap-1 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                          <MapPin className="h-3.5 w-3.5" />
                                          {roomLabel(session)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <Clock3 className="h-3.5 w-3.5" />
                                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <UserRound className="h-3.5 w-3.5" />
                                          {professorLabel(session)}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                          {labelForDay(session.dayOfWeek)} • {formatDuration(session.startTime, session.endTime)}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
