"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageActionButton } from "@/components/dashboard-kit";

const classes = [
  { id: 1, year: "4th Year - IT", subject: "Computer Systems", instructor: "Dr. Hesham A.Mohamed", students: 45, time: "9:30AM" },
  { id: 2, year: "4th Year - IT", subject: "Database", instructor: "Dr. Dorothy Guirgues", students: 45, time: "11:30AM" },
  { id: 3, year: "3rd Year - IT", subject: "Network", instructor: "Dr. Amr Adel", students: 67, time: "8:00AM" },
  { id: 4, year: "2nd Year - IT", subject: "Network", instructor: "Dr. Manar Ahmed", students: 70, time: "10:30AM" },
  { id: 5, year: "2nd Year - IT", subject: "Web Development", instructor: "Dr. Ahmed Ali", students: 70, time: "2:00PM" },
  { id: 6, year: "1st Year - IT", subject: "Network", instructor: "Dr. Amr Adel", students: 77, time: "11:00AM" },
];

export default function ClassesPage() {
  return (
    <DashboardLayout
      title="Class Management"
      description="Manage classes and view students"
      action={
        <Link href="/classes/new">
          <PageActionButton icon={Plus}>Add Class</PageActionButton>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.id} className="dashboard-panel gap-0 py-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[19px] font-semibold leading-8 tracking-[-0.02em] text-foreground">
                    {cls.year}
                  </h3>
                  <p className="text-[18px] leading-7 text-[#696475]">{cls.subject}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Pencil className="h-4 w-4 text-foreground" />
                  <Trash2 className="h-4 w-4 text-[#ff7f89]" />
                </div>
              </div>

              <div className="mt-6 space-y-1 text-[14px] text-muted-foreground">
                <p>{cls.instructor}</p>
                <p>{cls.students} Students</p>
                <p>{cls.time}</p>
              </div>

              <Link href={`/classes/${cls.id}`}>
                <Button variant="outline" className="mt-6 h-9 w-full rounded-[8px]">
                  More Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
