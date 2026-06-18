"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageActionButton } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi, classesApi, studentsApi } from "@/lib/api/services";
import type { ClassRecord } from "@/lib/api/types";
import { studentFormSchema } from "@/validators/student-form-schema";

type RowItem = {
  index: number;
  values: Record<string, string>;
  errors: string[];
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function downloadTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Full Name", "Email", "Password", "Student Code", "Class ID"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student-import-template.xlsx");
}

export default function ImportStudentsPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [rows, setRows] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setClasses(await classesApi.list());
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load classes.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const classMap = useMemo(
    () => new Map(classes.map((item) => [item.id, item])),
    [classes],
  );
  const validRows = rows.filter((row) => row.errors.length === 0);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
      });

      console.log(records);
      const nextRows = records.map((record, index) => {
        const normalized = Object.fromEntries(
          Object.entries(record).map(([key, value]) => [
            normalizeHeader(key),
            String(value ?? ""),
          ]),
        );
        const values = {
          fullName: normalized["full name"] ?? normalized.fullname ?? "",
          email: normalized.email ?? "",
          password: normalized.password ?? "",
          studentCode:
            normalized["student code"] ?? normalized.studentcode ?? "",
          classId: Number(normalized["class id"] ?? normalized.classid ?? ""),
        };

        const errors: string[] = [];

        try {
          studentFormSchema.validateSync(values, { abortEarly: false });
        } catch (validationError) {
          if (validationError instanceof Error && "inner" in validationError) {
            errors.push(
              ...(
                (validationError as { inner?: Array<{ message: string }> })
                  .inner ?? []
              ).map((item) => item.message),
            );
          }
        }

        if (!classMap.has(values.classId)) {
          errors.push("Class ID must match an existing class");
        }

        return { index: index + 2, values, errors };
      });

      setRows(nextRows);
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Unable to parse spreadsheet.",
      );
      setRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    setUploading(true);
    try {
      for (let index = 0; index < validRows.length; index += 1) {
        const row = validRows[index];
        const record = await studentsApi.create({
          fullName: row.values.fullName.trim(),
          email: row.values.email.trim().toLowerCase(),
          password: row.values.password,
          studentCode: row.values.studentCode.trim(),
          classId: row.values.classId,
        });
        await attendanceApi
          .create({
            studentId: record.id,
            date: new Date().toISOString().slice(0, 10),
            status: "PRESENT",
          })
          .catch(() => undefined);
        setProgress(Math.round(((index + 1) / validRows.length) * 100));
      }

      toast({
        title: "Import completed",
        description: `Imported ${validRows.length} student records successfully.`,
      });
      setRows([]);
    } catch (importError) {
      toast({
        title: "Import failed",
        description:
          importError instanceof Error
            ? importError.message
            : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <DashboardLayout
      title="Import Students"
      description="Upload an Excel sheet, validate rows, and create student records"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <Card className="dashboard-panel">
          <CardContent className="grid gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              Supported formats: .xlsx, .xls. Required columns: Full Name,
              Email, Password, Student Code, Class ID.
            </p>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading classes...
              </p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {parsing ? (
              <p className="text-sm text-muted-foreground">
                Parsing spreadsheet...
              </p>
            ) : null}
            {uploading ? <Progress value={progress} /> : null}
          </CardContent>
        </Card>

        {rows.length ? (
          <Card className="dashboard-panel gap-0 overflow-hidden py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#fcfbff]">
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Class ID</TableHead>
                    <TableHead>Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.index}>
                      <TableCell>{row.index}</TableCell>
                      <TableCell>{row.values.fullName}</TableCell>
                      <TableCell>{row.values.email}</TableCell>
                      <TableCell>{row.values.studentCode}</TableCell>
                      <TableCell>{row.values.classId}</TableCell>
                      <TableCell
                        className={row.errors.length ? "text-destructive" : ""}
                      >
                        {row.errors.length ? row.errors.join(", ") : "Ready"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Total Rows: {rows.length} Imported: {validRows.length} Failed:{" "}
            {rows.length - validRows.length}
          </p>
          <Button
            className="rounded-xl"
            onClick={handleImport}
            disabled={!validRows.length || uploading}
          >
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Importing..." : "Confirm Import"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
