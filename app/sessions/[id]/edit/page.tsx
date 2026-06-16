"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionForm } from "@/forms/session/session-form";
import { classesApi, modulesApi, roomsApi, sessionsApi } from "@/lib/api/services";
import type { ClassRecord, ModuleRecord, RoomRecord, SessionRecord } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

function mapOptions(records: Array<ClassRecord | ModuleRecord | RoomRecord>) {
  return records.map((record) => ({
    value: record.id,
    label: "code" in record && record.code ? `${record.code} - ${record.name}` : record.name,
  }));
}

export default function EditSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
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
      void loadData();
    }

    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <DashboardLayout title="Edit Session" description="Update the selected session">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading session...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : sessionRecord ? (
        <SessionForm
          cancelHref={`/sessions/${sessionRecord.id}`}
          classOptions={mapOptions(classes)}
          moduleOptions={mapOptions(modules)}
          roomOptions={mapOptions(rooms)}
          defaultValues={{
            classId: sessionRecord.classId,
            moduleId: sessionRecord.moduleId,
            roomId: sessionRecord.roomId,
            dayOfWeek: sessionRecord.dayOfWeek,
            startTime: sessionRecord.startTime,
            endTime: sessionRecord.endTime,
          }}
          submitLabel="Update Session"
          onSubmit={async (values) => {
            await sessionsApi.update(sessionRecord.id, values);
            toast({ title: "Session updated", description: "The session details were saved successfully." });
            router.push(`/sessions/${sessionRecord.id}`);
            router.refresh();
          }}
        />
      ) : (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Session not found.
        </div>
      )}
    </DashboardLayout>
  );
}
