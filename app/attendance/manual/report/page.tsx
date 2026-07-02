"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  ManualAttendanceMetric,
  ManualAttendanceRecordsTable,
} from "@/components/manual-attendance/manual-attendance-widgets";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isValidDateInput,
  manualAttendanceKeys,
  readManualAttendanceError,
  todayInputValue,
  useManualAttendanceReferenceData,
} from "@/hooks/useManualAttendance";
import { manualAttendanceApi } from "@/services/manual-attendance";
import type { ManualAttendanceReportParams } from "@/types/manual-attendance";

export default function AttendanceReportView() {
  const referenceQuery = useManualAttendanceReferenceData();
  const [classId, setClassId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [from, setFrom] = useState(todayInputValue());
  const [to, setTo] = useState(todayInputValue());
  const [params, setParams] = useState<ManualAttendanceReportParams | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const reportQuery = useQuery({
    queryKey: params
      ? manualAttendanceKeys.report(params)
      : [...manualAttendanceKeys.all, "report", "idle"],
    queryFn: () => manualAttendanceApi.report(params as ManualAttendanceReportParams),
    enabled: Boolean(params),
  });

  function loadReport() {
    if (!classId) {
      setValidationError("Class is required.");
      return;
    }

    if (!moduleId) {
      setValidationError("Module is required.");
      return;
    }

    if (!isValidDateInput(from) || !isValidDateInput(to)) {
      setValidationError("Enter valid report dates in YYYY-MM-DD format.");
      return;
    }

    setValidationError(null);
    setParams({ classId, moduleId, from, to });
  }

  const report = reportQuery.data;
  const error = referenceQuery.error ?? reportQuery.error;

  return (
    <DashboardLayout
      title="Attendance Report"
      description="Review manual attendance totals by class and module"
    >
      <div className="dashboard-page">
        {validationError || error ? (
          <Alert variant="destructive" className="rounded-lg">
            <AlertDescription>
              {validationError ??
                readManualAttendanceError(error, "Unable to load attendance report.")}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-5">
            <Select
              value={classId}
              onValueChange={(value) => {
                setClassId(value);
                setValidationError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.classes ?? []).map((classRecord) => (
                  <SelectItem key={classRecord.id} value={String(classRecord.id)}>
                    {classRecord.code ? `${classRecord.code} - ${classRecord.name}` : classRecord.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={moduleId}
              onValueChange={(value) => {
                setModuleId(value);
                setValidationError(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {(referenceQuery.data?.modules ?? []).map((moduleRecord) => (
                  <SelectItem key={moduleRecord.id} value={String(moduleRecord.id)}>
                    {moduleRecord.code ? `${moduleRecord.code} - ${moduleRecord.name}` : moduleRecord.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setValidationError(null);
              }}
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setValidationError(null);
              }}
            />
            <Button
              type="button"
              className="rounded-lg"
              disabled={reportQuery.isFetching}
              onClick={loadReport}
            >
              {reportQuery.isFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              {reportQuery.isFetching ? "Loading..." : "Load Report"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ManualAttendanceMetric
            label="Total Students"
            value={report?.totalStudents ?? 0}
          />
          <ManualAttendanceMetric
            label="Present"
            value={report?.present ?? 0}
            tone="success"
          />
          <ManualAttendanceMetric
            label="Absent"
            value={report?.absent ?? 0}
            tone="danger"
          />
          <ManualAttendanceMetric
            label="Late"
            value={report?.late ?? 0}
            tone="warning"
          />
        </div>

        <ManualAttendanceRecordsTable
          records={report?.records ?? []}
          loading={reportQuery.isLoading || reportQuery.isFetching}
          emptyMessage={params ? "No report records found." : "Select filters and load a report."}
        />
      </div>
    </DashboardLayout>
  );
}
