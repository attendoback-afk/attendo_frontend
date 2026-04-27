"use client";

import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const reports = [
  { id: 1, department: "IT", year: "3rd", module: "Computer Systems", instructor: "Dr.Hesham A.Mohamed" },
  { id: 2, department: "IT", year: "4th", module: "Database", instructor: "Dr.Youssef Alaa" },
  { id: 3, department: "Electrical Technology", year: "1st", module: "Microcontrollers", instructor: "Dr.Mohamed Ali" },
  { id: 4, department: "Mechanical Technology", year: "4th", module: "Fluid Mechanics", instructor: "Dr.Eslam Yasser" },
  { id: 5, department: "Electrical Technology", year: "2nd", module: "Circuit analysis", instructor: "Dr.Mazen Gamal" },
];

export default function ReportsPage() {
  return (
    <DashboardLayout
      title="Reports"
      description="Download attendance and performance reports"
    >
      <div className="dashboard-panel overflow-hidden">
        <Table>
          <TableHeader className="bg-[#fcfbff]">
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Module Name</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="w-[220px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium text-[#6f6a7e]">{report.department}</TableCell>
                <TableCell>{report.year}</TableCell>
                <TableCell>{report.module}</TableCell>
                <TableCell>{report.instructor}</TableCell>
                <TableCell className="text-right">
                  <button className="inline-flex items-center gap-3 text-[14px] font-medium text-foreground">
                    <Download className="h-5 w-5" />
                    Download Report
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
