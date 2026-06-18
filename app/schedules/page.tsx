"use client";

import { Plus, Clock3, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton } from "@/components/dashboard-kit";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timeSlots = [
  { start: "08:00", end: "09:30" },
  { start: "09:45", end: "11:15" },
  { start: "11:30", end: "13:00" },
  { start: "13:15", end: "14:45" },
  { start: "15:00", end: "16:30" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const scheduleData: Record<string, Record<string, { subject: string; year: string; room: string } | null>> = {
  "08:00": {
    Monday: { subject: "Data Structures", year: "3rd Year - A", room: "Lab 101" },
    Tuesday: null,
    Wednesday: { subject: "Database Systems", year: "4th Year - A", room: "Lab 102" },
    Thursday: null,
    Friday: { subject: "Data Structures", year: "3rd Year - A", room: "Lab 101" },
  },
  "09:45": {
    Monday: { subject: "Algorithms", year: "3rd Year - B", room: "Room 205" },
    Tuesday: { subject: "Anatomy", year: "1st Year - C", room: "Room 301" },
    Wednesday: null,
    Thursday: { subject: "Algorithms", year: "3rd Year - B", room: "Room 205" },
    Friday: null,
  },
  "11:30": {
    Monday: null,
    Tuesday: { subject: "Data Structures", year: "3rd Year - A", room: "Lab 101" },
    Wednesday: { subject: "Anatomy", year: "1st Year - C", room: "Room 301" },
    Thursday: null,
    Friday: { subject: "Database Systems", year: "4th Year - A", room: "Lab 102" },
  },
  "13:15": {
    Monday: { subject: "Database Systems", year: "4th Year - A", room: "Lab 102" },
    Tuesday: null,
    Wednesday: { subject: "Data Structures", year: "3rd Year - A", room: "Lab 101" },
    Thursday: { subject: "Database Systems", year: "4th Year - A", room: "Lab 102" },
    Friday: null,
  },
  "15:00": {
    Monday: null,
    Tuesday: { subject: "Algorithms", year: "3rd Year - B", room: "Room 205" },
    Wednesday: null,
    Thursday: { subject: "Anatomy", year: "1st Year - C", room: "Room 301" },
    Friday: null,
  },
};

export default function SchedulesPage() {
  return (
    <DashboardLayout
      title="Schedule Management"
      description="Manage weekly timetable and class schedules"
      action={<PageActionButton icon={Plus}>Add Schedule</PageActionButton>}
    >
      <div className="dashboard-page">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Year..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Department..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="it">Information Technology</SelectItem>
              <SelectItem value="electrical">Electrical Technology</SelectItem>
              <SelectItem value="mechanical">Mechanical Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="dashboard-panel overflow-x-auto">
          <div className="grid min-w-[920px] grid-cols-[110px_repeat(5,minmax(150px,1fr))]">
            <div className="bg-[#fcfbff] px-4 py-4 text-[14px] font-semibold">Time</div>
            {days.map((day) => (
              <div key={day} className="bg-[#fcfbff] px-4 py-4 text-center text-[14px] font-semibold">
                {day}
              </div>
            ))}

            {timeSlots.map((slot) => (
              <div key={slot.start} className="contents">
                <div key={`slot-${slot.start}`} className="border-t border-border px-4 py-4">
                  <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
                    <Clock3 className="mt-0.5 h-4 w-4" />
                    <div>
                      <div>{slot.start} -</div>
                      <div>{slot.end}</div>
                    </div>
                  </div>
                </div>
                {days.map((day) => {
                  const classData = scheduleData[slot.start]?.[day];
                  return (
                    <div key={`${slot.start}-${day}`} className="border-t border-border p-3">
                      {classData ? (
                        <Card className="h-full rounded-[6px] border-[#e6ecfb] bg-[#f3f6ff] py-0">
                          <CardContent className="p-3">
                            <p className="text-[13px] font-medium leading-5 text-foreground">{classData.subject}</p>
                            <p className="text-[11px] text-muted-foreground">{classData.year}</p>
                            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {classData.room}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="flex min-h-[70px] items-center justify-center rounded-[6px] border border-dashed border-[#eee8f6] text-[28px] font-light text-[#8d8798]">
                          +
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
