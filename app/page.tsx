"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoftStatusBadge } from "@/components/dashboard-kit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, BookOpen, Calendar, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";

const attendanceTrendData = [
  { day: "Mon", attendance: 89 },
  { day: "Tue", attendance: 86 },
  { day: "Wed", attendance: 94 },
  { day: "Thu", attendance: 92 },
  { day: "Fri", attendance: 2 },
  { day: "Sat", attendance: 100 },
  { day: "Su", attendance: 98 },
];

const subjectAttendanceData = [
  { subject: "Computer Systems", attendance: 92 },
  { subject: "Database", attendance: 78 },
  { subject: "Network", attendance: 86 },
  { subject: "Microcontroller", attendance: 82 },
  { subject: "Software development", attendance: 96 },
];

const absentStudents = [
  { name: "Ahmed Hassan", class: "3rd Year - IT", absences: 16, status: "At Risk" },
  { name: "Omar Ali", class: "4th Year - IT", absences: 12, status: "At Risk" },
  { name: "Khaled Mahmoud", class: "2nd Year - IT", absences: 10, status: "At Risk" },
  { name: "Ahmed Ibrahim", class: "1st Year - IT", absences: 9, status: "At Risk" },
];

const stats = [
  { title: "Total Students", value: "1,245", change: "+12.5%", icon: Users, trend: "up" },
  { title: "Total Classes", value: "52", change: "+3.7%", icon: BookOpen, trend: "up" },
  { title: "Sessions Today", value: "26", change: "0%", icon: Calendar, trend: "neutral" },
  { title: "Attendance Today", value: "85.4%", change: "+2.5%", icon: TrendingUp, trend: "up" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back! Here's what's happening today."
    >
      <div className="dashboard-page">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="dashboard-panel gap-0 py-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#f6f2ff]">
                    <stat.icon className="h-[18px] w-[18px] text-[#9e95cd]" />
                  </div>
                  <span
                    className={`text-[13px] font-medium ${
                      stat.trend === "up" ? "text-[#9990bb]" : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="mt-7">
                  <p className="text-[31px] font-semibold leading-none tracking-[-0.03em] text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[14px] text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_0.98fr]">
          <Card className="dashboard-panel gap-0 py-0">
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="dashboard-section-title">
                Attendance Trend (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-2">
              <div className="h-[208px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#a09aac" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e8e4f2" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a09aac" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e8e4f2" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#ebe7f4",
                        boxShadow: "0 10px 24px rgba(46,42,57,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#d8d2ee"
                      strokeWidth={1.5}
                      dot={{ r: 2.5, fill: "#ffffff", stroke: "#c3b8ff", strokeWidth: 1.5 }}
                      activeDot={{ r: 4, fill: "#ffffff", stroke: "#c3b8ff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-panel gap-0 py-0">
            <CardHeader className="pb-0 pt-5">
              <CardTitle className="dashboard-section-title">Attendance per Subject</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-2">
              <div className="h-[208px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectAttendanceData}>
                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 9, fill: "#a09aac" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e8e4f2" }}
                      interval={0}
                      height={38}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a09aac" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e8e4f2" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#ebe7f4",
                        boxShadow: "0 10px 24px rgba(46,42,57,0.08)",
                      }}
                    />
                    <Bar dataKey="attendance" fill="#bbb2e3" radius={[0, 0, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel gap-0 py-0">
          <CardHeader className="pb-1 pt-5">
            <CardTitle className="dashboard-section-title">Top Absent Students</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-center">Total Absences</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absentStudents.map((student) => (
                  <TableRow key={student.name}>
                    <TableCell className="font-medium text-[#6f6a7e]">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="text-center">{student.absences}</TableCell>
                    <TableCell className="text-center">
                      <SoftStatusBadge tone="danger" className="mx-auto">
                        {student.status}
                      </SoftStatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
