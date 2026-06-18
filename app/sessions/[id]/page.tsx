"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classesApi, modulesApi, roomsApi, sessionsApi } from "@/lib/api/services";
import { DAY_OF_WEEK_LABELS, type ClassRecord, type ModuleRecord, type RoomRecord, type SessionRecord } from "@/lib/api/types";

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

function formatSessionTime(value: string) {
  const { hours, minutes } = parseTimeValue(value);
  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes));

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function buildLabel(record: ClassRecord | ModuleRecord | RoomRecord | null | undefined) {
  if (!record) return "";
  if ("code" in record && record.code) return `${record.code} - ${record.name}`;
  return record.name;
}

export default function SessionDetailsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setLoading(true);
      setError(null);

      try {
        const [session, classRecords, moduleRecords, roomRecords] = await Promise.all([
          sessionsApi.get(sessionId),
          classesApi.list(),
          modulesApi.list(),
          roomsApi.list(),
        ]);

        if (!active) {
          return;
        }

        setSessionRecord(session);
        setClasses(classRecords);
        setModules(moduleRecords);
        setRooms(roomRecords);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load the session.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      void loadSession();
    }

    return () => {
      active = false;
    };
  }, [sessionId]);

  const classMap = useMemo(() => new Map(classes.map((item) => [item.id, item])), [classes]);
  const moduleMap = useMemo(() => new Map(modules.map((item) => [item.id, item])), [modules]);
  const roomMap = useMemo(() => new Map(rooms.map((item) => [item.id, item])), [rooms]);

  return (
    <DashboardLayout
      title="Session Details"
      description="Review the selected session"
      action={
        sessionRecord ? (
          <Button asChild className="rounded-xl">
            <Link href={`/sessions/${sessionRecord.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Session
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="dashboard-page">
        <Card className="dashboard-panel gap-0 overflow-hidden py-0">
          <CardContent className="p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading session details...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : sessionRecord ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {buildLabel(classMap.get(sessionRecord.classId))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Module</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {buildLabel(moduleMap.get(sessionRecord.moduleId))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {buildLabel(roomMap.get(sessionRecord.roomId))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Day of Week</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {labelForDay(sessionRecord.dayOfWeek)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatSessionTime(sessionRecord.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">
                    {formatSessionTime(sessionRecord.endTime)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Session not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
