"use client";

import { usePeopleStore } from "@/components/providers/people-provider";

export function useStudents() {
  const { students, addStudent, addStudents, updateStudent, deleteStudent } = usePeopleStore();

  return {
    students,
    addStudent,
    addStudents,
    updateStudent,
    deleteStudent,
  };
}
