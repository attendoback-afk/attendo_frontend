"use client";

import { useDepartmentStore } from "@/components/providers/department-provider";

export function useDepartments() {
  return useDepartmentStore();
}
