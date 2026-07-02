"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  classesApi,
  modulesApi,
  sessionsApi,
  studentsApi,
} from "@/lib/api/services";
import { manualAttendanceApi } from "@/services/manual-attendance";
import type {
  ManualAttendanceFilters,
  ManualAttendanceListParams,
  ManualAttendanceReportParams,
  ManualAttendanceStatus,
} from "@/types/manual-attendance";

export const manualAttendanceKeys = {
  all: ["manual-attendance"] as const,
  reference: () => [...manualAttendanceKeys.all, "reference"] as const,
  students: () => [...manualAttendanceKeys.all, "students"] as const,
  list: (params: ManualAttendanceListParams) =>
    [...manualAttendanceKeys.all, "list", params] as const,
  report: (params: ManualAttendanceReportParams) =>
    [...manualAttendanceKeys.all, "report", params] as const,
};

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function readManualAttendanceError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useManualAttendanceReferenceData() {
  return useQuery({
    queryKey: manualAttendanceKeys.reference(),
    queryFn: async () => {
      const [classes, modules, sessions] = await Promise.all([
        classesApi.list(),
        modulesApi.list(),
        sessionsApi.list(),
      ]);

      return { classes, modules, sessions };
    },
  });
}

export function useStudentsForClass(classId: string) {
  return useQuery({
    queryKey: [...manualAttendanceKeys.students(), classId] as const,
    queryFn: async () => {
      const students = await studentsApi.list();

      return classId
        ? students.filter((student) => String(student.classId) === String(classId))
        : students;
    },
  });
}

export function useManualAttendanceController() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ManualAttendanceFilters>({
    sessionId: "",
    classId: "",
    date: todayInputValue(),
    status: "all",
  });
  const [submittedFilters, setSubmittedFilters] =
    useState<ManualAttendanceListParams | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const attendanceQuery = useQuery({
    queryKey: submittedFilters
      ? manualAttendanceKeys.list(submittedFilters)
      : [...manualAttendanceKeys.all, "list", "idle"],
    queryFn: () => manualAttendanceApi.list(submittedFilters as ManualAttendanceListParams),
    enabled: Boolean(submittedFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => manualAttendanceApi.delete(id),
    onSuccess: () => {
      if (submittedFilters) {
        void queryClient.invalidateQueries({
          queryKey: manualAttendanceKeys.list(submittedFilters),
        });
      }
    },
  });

  const canLoad = useMemo(
    () => Boolean(filters.sessionId && filters.classId && filters.date),
    [filters.classId, filters.date, filters.sessionId],
  );

  function updateFilter<Key extends keyof ManualAttendanceFilters>(
    key: Key,
    value: ManualAttendanceFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
    setValidationError(null);
  }

  function loadAttendance() {
    if (!filters.sessionId) {
      setValidationError("Session is required.");
      return;
    }

    if (!filters.classId) {
      setValidationError("Class is required.");
      return;
    }

    if (!isValidDateInput(filters.date)) {
      setValidationError("Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setValidationError(null);
    setSubmittedFilters({
      sessionId: filters.sessionId,
      classId: filters.classId,
      date: filters.date,
      status:
        filters.status === "all"
          ? undefined
          : (filters.status as ManualAttendanceStatus),
    });
  }

  return {
    filters,
    submittedFilters,
    validationError,
    records: attendanceQuery.data ?? [],
    isLoading: attendanceQuery.isLoading || attendanceQuery.isFetching,
    error: attendanceQuery.error ?? deleteMutation.error,
    canLoad,
    isDeleting: deleteMutation.isPending,
    updateFilter,
    loadAttendance,
    refresh: attendanceQuery.refetch,
    deleteRecord: deleteMutation.mutateAsync,
  };
}
