"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classesApi, modulesApi, roomsApi, sessionsApi } from "@/lib/api/services";
import type { ClassRecord, ModuleRecord, RoomRecord, SessionRecord } from "@/lib/api/types";

function labelForDay(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
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
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{sessionRecord.startTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="mt-1 text-[18px] font-semibold text-foreground">{sessionRecord.endTime}</p>
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
