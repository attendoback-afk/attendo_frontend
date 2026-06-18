"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/forms/room/room-form";
import { useToast } from "@/hooks/use-toast";
import { roomsApi } from "@/lib/api/services";
import type { RoomRecord } from "@/lib/api/types";

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRoom() {
      if (!roomId) {
        setError("Room ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await roomsApi.get(roomId);
        if (active) {
          setRoom(data);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to load room";
          setError(message);
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRoom();

    return () => {
      active = false;
    };
  }, [roomId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !room) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">{error || "Room not found"}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-page gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button asChild variant="link" className="p-0 text-muted-foreground h-auto">
            <Link href="/rooms">Rooms</Link>
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span>Edit Room</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Room</h1>
          <p className="mt-2 text-muted-foreground">Update the room information below</p>
        </div>

        <RoomForm cancelHref="/rooms" room={room} />
      </div>
    </DashboardLayout>
  );
}
