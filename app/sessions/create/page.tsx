"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionForm } from "@/forms/session/session-form";
import { classesApi, modulesApi, roomsApi, sessionsApi } from "@/lib/api/services";
import type { ClassRecord, ModuleRecord, RoomRecord } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

function mapOptions(records: Array<ClassRecord | ModuleRecord | RoomRecord>) {
  return records.map((record) => ({
    value: record.id,
    label: "code" in record && record.code ? `${record.code} - ${record.name}` : record.name,
  }));
}

export default function CreateSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setLoading(true);
      setError(null);

      try {
        const [classRecords, moduleRecords, roomRecords] = await Promise.all([
          classesApi.list(),
          modulesApi.list(),
          roomsApi.list(),
        ]);

        if (!active) {
          return;
        }

        setClasses(classRecords);
        setModules(moduleRecords);
        setRooms(roomRecords);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load session options.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout title="Create Session" description="Add a new session schedule">
      {loading ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Loading session options...
        </div>
      ) : error ? (
        <div className="dashboard-panel px-6 py-5 text-sm text-destructive">{error}</div>
      ) : (
        <SessionForm
          cancelHref="/sessions"
          classOptions={mapOptions(classes)}
          moduleOptions={mapOptions(modules)}
          roomOptions={mapOptions(rooms)}
          onSubmit={async (values) => {
            await sessionsApi.create(values);
            toast({ title: "Session created", description: "The new session has been saved." });
            router.push("/sessions");
            router.refresh();
          }}
        />
      )}
    </DashboardLayout>
  );
}
