import { apiRequest, toArray } from "@/lib/api/client";
import type {
  BulkManualAttendancePayload,
  ManualAttendanceListParams,
  ManualAttendanceRecord,
  ManualAttendanceReport,
  ManualAttendanceReportParams,
  ManualAttendanceStatus,
  MarkManualAttendancePayload,
} from "@/types/manual-attendance";

const json = (payload: unknown) => JSON.stringify(payload);

function withQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

function normalizeReport(payload: unknown): ManualAttendanceReport {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const summary =
    record.summary && typeof record.summary === "object"
      ? (record.summary as Record<string, unknown>)
      : record;

  return {
    totalStudents: Number(summary.totalStudents ?? summary.total ?? 0),
    present: Number(summary.present ?? summary.totalPresent ?? 0),
    absent: Number(summary.absent ?? summary.totalAbsent ?? 0),
    late: Number(summary.late ?? summary.totalLate ?? 0),
    class: record.class as ManualAttendanceReport["class"],
    module: record.module as ManualAttendanceReport["module"],
    records: toArray<ManualAttendanceRecord>(
      record.records ?? record.attendance ?? record.items ?? record.data ?? payload,
    ),
  };
}

export const manualAttendanceApi = {
  list: async (params: ManualAttendanceListParams) =>
    toArray<ManualAttendanceRecord>(
      await apiRequest<unknown>(
        withQuery("/attendance", {
          sessionId: params.sessionId,
          classId: params.classId,
          date: params.date,
          status: params.status,
        }),
      ),
    ),
  create: (payload: MarkManualAttendancePayload) =>
    apiRequest<ManualAttendanceRecord>("/attendance", {
      method: "POST",
      body: json(payload),
    }),
  bulkCreate: (payload: BulkManualAttendancePayload) =>
    apiRequest<ManualAttendanceRecord[]>("/attendance/bulk", {
      method: "POST",
      body: json(payload),
    }),
  report: async (params: ManualAttendanceReportParams) =>
    normalizeReport(
      await apiRequest<unknown>(
        withQuery(`/attendance/report/class/${encodeURIComponent(params.classId)}`, {
          moduleId: params.moduleId,
        }),
      ),
    ),
  update: (id: string, status: ManualAttendanceStatus) =>
    apiRequest<ManualAttendanceRecord>(`/attendance/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: json({ status }),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/attendance/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
