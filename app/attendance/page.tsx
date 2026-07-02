"use client";

import { Check, Minus, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { LiveAttendanceSessionsSection } from "@/components/live-session/live-attendance-sessions-section";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const students = [
  "Michele Johnson",
  "Richi Akon",
  "Amanda Kherr",
  "Michele Johnson",
  "Richi Akon",
  "Amanda Kherr",
  "Michele Johnson",
  "Richi Akon",
  "Amanda Kherr",
  "Michele Johnson",
  "Richi Akon",
  "Amanda Kherr",
  "Michele Johnson",
  "Richi Akon",
  "Amanda Kherr",
];

const attendanceData = students.map((name) => ({
  name,
  attendance: Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    if ([7, 14, 21, 28].includes(day)) return "empty";
    if ([4, 8, 13, 18, 24].includes(day)) return "absent";
    return "present";
  }),
}));

export default function AttendancePage() {
  return (
    <DashboardLayout
      title="Schedule Management"
      description="Manage weekly timetable and class schedules"
    >
      <div className="dashboard-page">
        <LiveAttendanceSessionsSection />
{/* 
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
          {["Select Year...", "Select Department...", "Select Month..."].map((placeholder, index) => (
            <Select key={placeholder}>
              <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={`${index}-1`}>Option 1</SelectItem>
                <SelectItem value={`${index}-2`}>Option 2</SelectItem>
              </SelectContent>
            </Select>
          ))}
          <Input placeholder="Search Name..." />
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-border bg-card">
          <div className="px-1 pb-1 pt-6 md:px-0">
            <h3 className="px-5 text-[18px] font-semibold tracking-[-0.02em] text-foreground">
              Attendance Sheet for the 3rd Year IT Department: March 2026
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1240px] border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 border-b border-border bg-white px-4 py-3 text-left font-semibold">
                    Students
                  </th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="border-b border-border px-3 py-3 text-center font-semibold">
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student, idx) => (
                  <tr key={`${student.name}-${idx}`}>
                    <td className="sticky left-0 border-b border-border bg-white px-4 py-3 text-[14px] text-[#6f6a7e]">
                      {student.name}
                    </td>
                    {student.attendance.map((status, dayIdx) => (
                      <td key={dayIdx} className="border-b border-border px-3 py-3 text-center">
                        {status === "present" ? (
                          <Check className="mx-auto h-4 w-4 text-[#43b06a]" strokeWidth={3} />
                        ) : status === "absent" ? (
                          <X className="mx-auto h-4 w-4 text-[#e84f5a]" strokeWidth={3} />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-[#cfcbd9]" strokeWidth={3} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
