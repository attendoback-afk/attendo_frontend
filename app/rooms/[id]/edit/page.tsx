"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/forms/room/room-form";
import type { RoomRecord } from "@/lib/api/types";

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!roomId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Room ID not found</p>
        </div>
      </DashboardLayout>
    );
  }

  // Create a minimal room object with the ID from route params
  // The form will use this ID for the update operation
  const room: RoomRecord = {
    id: roomId,
    name: "",
  };

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
