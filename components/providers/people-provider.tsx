"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialAdmins,
  initialStudents,
  type AdminRecord,
  type StudentRecord,
} from "@/lib/people-store";

type AdminInput = Omit<AdminRecord, "id" | "createdAt">;
type StudentInput = Omit<StudentRecord, "id" | "createdAt">;

type PeopleContextValue = {
  admins: AdminRecord[];
  students: StudentRecord[];
  addAdmin: (input: AdminInput) => AdminRecord;
  addAdmins: (inputs: AdminInput[]) => AdminRecord[];
  updateAdmin: (id: string, input: AdminInput) => AdminRecord | null;
  deleteAdmin: (id: string) => void;
  addStudent: (input: StudentInput) => StudentRecord;
  addStudents: (inputs: StudentInput[]) => StudentRecord[];
  updateStudent: (id: string, input: StudentInput) => StudentRecord | null;
  deleteStudent: (id: string) => void;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

function createAdminRecord(input: AdminInput): AdminRecord {
  return {
    ...input,
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    createdAt: new Date(),
  };
}

function createStudentRecord(input: StudentInput): StudentRecord {
  return {
    ...input,
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    studentCode: input.studentCode.trim(),
    createdAt: new Date(),
  };
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState<AdminRecord[]>(initialAdmins);
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);

  const addAdmin = useCallback((input: AdminInput) => {
    const record = createAdminRecord(input);
    setAdmins((current) => [record, ...current]);
    return record;
  }, []);

  const addAdmins = useCallback((inputs: AdminInput[]) => {
    const records = inputs.map(createAdminRecord);
    setAdmins((current) => [...records, ...current]);
    return records;
  }, []);

  const updateAdmin = useCallback((id: string, input: AdminInput) => {
    let updatedRecord: AdminRecord | null = null;

    setAdmins((current) =>
      current.map((admin) => {
        if (admin.id !== id) {
          return admin;
        }

        updatedRecord = {
          ...admin,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          role: input.role,
          active: input.active,
        };

        return updatedRecord;
      }),
    );

    return updatedRecord;
  }, []);

  const deleteAdmin = useCallback((id: string) => {
    setAdmins((current) => current.filter((admin) => admin.id !== id));
  }, []);

  const addStudent = useCallback((input: StudentInput) => {
    const record = createStudentRecord(input);
    setStudents((current) => [record, ...current]);
    return record;
  }, []);

  const addStudents = useCallback((inputs: StudentInput[]) => {
    const records = inputs.map(createStudentRecord);
    setStudents((current) => [...records, ...current]);
    return records;
  }, []);

  const updateStudent = useCallback((id: string, input: StudentInput) => {
    let updatedRecord: StudentRecord | null = null;

    setStudents((current) =>
      current.map((student) => {
        if (student.id !== id) {
          return student;
        }

        updatedRecord = {
          ...student,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          studentCode: input.studentCode.trim(),
          active: input.active,
        };

        return updatedRecord;
      }),
    );

    return updatedRecord;
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((current) => current.filter((student) => student.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      admins,
      students,
      addAdmin,
      addAdmins,
      updateAdmin,
      deleteAdmin,
      addStudent,
      addStudents,
      updateStudent,
      deleteStudent,
    }),
    [
      addAdmin,
      addAdmins,
      updateAdmin,
      deleteAdmin,
      addStudent,
      addStudents,
      updateStudent,
      deleteStudent,
      admins,
      students,
    ],
  );

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
}

export function usePeopleStore() {
  const context = useContext(PeopleContext);

  if (!context) {
    throw new Error("usePeopleStore must be used within PeopleProvider.");
  }

  return context;
}
