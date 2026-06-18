"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { RoomForm } from "@/forms/room/room-form";

export default function CreateRoomPage() {
  return (
    <DashboardLayout>
      <div className="dashboard-page gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button asChild variant="link" className="p-0 text-muted-foreground h-auto">
            <Link href="/rooms">Rooms</Link>
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span>Create New Room</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Room</h1>
          <p className="mt-2 text-muted-foreground">Add a new room to the system</p>
        </div>

        <RoomForm cancelHref="/rooms" />
      </div>
    </DashboardLayout>
  );
}
