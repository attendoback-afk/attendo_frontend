"use client";

import { CircleX, Crosshair, TimerReset } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SoftStatusBadge } from "@/components/dashboard-kit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const registeredStudents = [
  { name: "Ahmed Hassan", time: "2026-04-06 09:15:22", status: "Success" },
  { name: "Sara Mohamed", time: "2026-04-06 09:15:25", status: "Success" },
  { name: "Eslam Ali", time: "2026-04-06 09:15:30", status: "Success" },
  { name: "Fatma Ibrahim", time: "2026-04-06 09:15:35", status: "Success" },
];

export default function ClassDetailPage() {
  return (
    <DashboardLayout title="Computer Systems" description="4rd Year - IT">
      <div className="dashboard-page">
        <div className="flex flex-col items-center">
          <div className="flex h-[228px] w-[228px] items-center justify-center bg-white">
            <div className="h-[228px] w-[228px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjUwIDI1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmZmYiLz48ZyBmaWxsPSIjMDAwIj48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIvPjxyZWN0IHg9IjE3MCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIvPjxyZWN0IHg9IjIwIiB5PSIxNzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIvPjxyZWN0IHg9IjEwMCIgeT0iNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IHg9IjEyMCIgeT0iMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHg9IjE0MCIgeT0iNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHg9IjE0MCIgeT0iODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IHg9IjEwMCIgeT0iMTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48cmVjdCB4PSIxMjAiIHk9IjEwMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIi8+PHJlY3QgeD0iMTYwIiB5PSIxMDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHg9IjE4MCIgeT0iOTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IHg9IjEwMCIgeT0iMTQwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTAiLz48cmVjdCB4PSIxNTAiIHk9IjE0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjMwIi8+PHJlY3QgeD0iMTgwIiB5PSIxNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHg9IjIwMCIgeT0iMTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMzAiLz48cmVjdCB4PSIxMDAiIHk9IjE4MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+PHJlY3QgeD0iMTIwIiB5PSIxODAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIvPjxyZWN0IHg9IjE0MCIgeT0iMTkwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTAiLz48cmVjdCB4PSIxOTAiIHk9IjE5MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjMwIi8+PC9nPjwvc3ZnPg==')] bg-contain bg-center bg-no-repeat" />
          </div>
          <p className="mt-4 text-center text-[18px] text-[#6f6a7e]">
            Please Scan the QR Code To Join The Lecture
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.95fr]">
          <Card className="dashboard-panel gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
                Registered Students
              </h2>
              <div className="mt-5 space-y-4">
                {registeredStudents.map((student) => (
                  <div
                    key={student.name}
                    className="flex items-center justify-between border-b border-[#f0edf7] pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-[14px] font-medium text-foreground">
                        {student.name}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {student.time}
                      </p>
                    </div>
                    <SoftStatusBadge tone="blue">
                      {student.status}
                    </SoftStatusBadge>
                  </div>
                ))}
              </div>
              <Progress
                value={29}
                className="mt-5 bg-[#ebe7f4]"
                indicatorClassName="bg-[#f68c4f]"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            {[
              { icon: "success", value: "35", label: "Registered" },
              { icon: "danger", value: "18", label: "Missing" },
              { icon: "neutral", value: "97%", label: "Avg Accuracy" },
            ].map((stat) => (
              <Card key={stat.label} className="dashboard-panel gap-0 py-0">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full">
                    {stat.icon === "success" ? (
                      <Crosshair className="h-7 w-7 text-[#a2d76b]" />
                    ) : stat.icon === "danger" ? (
                      <CircleX className="h-7 w-7 text-[#ff4659]" />
                    ) : (
                      <TimerReset className="h-7 w-7 text-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-[22px] font-semibold leading-none">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[14px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-3">
            <Progress
              value={26}
              className="h-1.5 flex-1 bg-[#ebe7f4]"
              indicatorClassName="bg-[#f68c4f]"
            />
            <div className="flex items-center gap-2 text-[18px] font-semibold text-[#f68c4f]">
              5:21
              <TimerReset className="h-5 w-5 text-[#8fdb71]" />
            </div>
          </div>
          <Button
            variant="destructive"
            className="h-9 rounded-full bg-[#ffe8eb] px-8 text-[#ff5d6a] hover:bg-[#ffdce1]"
          >
            <CircleX className="h-4 w-4" />
            Cancel Lecture
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
