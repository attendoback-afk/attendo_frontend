"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialDepartments, type Department } from "@/lib/departments-store";

type CreateDepartmentInput = Pick<Department, "name" | "description">;
type UpdateDepartmentInput = CreateDepartmentInput;

type DepartmentContextValue = {
  departments: Department[];
  addDepartment: (input: CreateDepartmentInput) => Department;
  updateDepartment: (id: string, input: UpdateDepartmentInput) => Department | null;
  deleteDepartment: (id: string) => void;
};

const DepartmentContext = createContext<DepartmentContextValue | null>(null);

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);

  const addDepartment = useCallback((input: CreateDepartmentInput) => {
    const department: Department = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
    };

    setDepartments((current) => [department, ...current]);

    return department;
  }, []);

  const updateDepartment = useCallback((id: string, input: UpdateDepartmentInput) => {
    let updatedDepartment: Department | null = null;

    setDepartments((current) =>
      current.map((department) => {
        if (department.id !== id) {
          return department;
        }

        updatedDepartment = {
          ...department,
          name: input.name.trim(),
          description: input.description.trim(),
        };

        return updatedDepartment;
      }),
    );

    return updatedDepartment;
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((current) => current.filter((department) => department.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      departments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
    }),
    [addDepartment, deleteDepartment, departments, updateDepartment],
  );

  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
}

export function useDepartmentStore() {
  const context = useContext(DepartmentContext);

  if (!context) {
    throw new Error("useDepartmentStore must be used within DepartmentProvider.");
  }

  return context;
}
