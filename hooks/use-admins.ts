"use client";

import { usePeopleStore } from "@/components/providers/people-provider";

export function useAdmins() {
  const { admins, addAdmin, addAdmins, updateAdmin, deleteAdmin } = usePeopleStore();

  return {
    admins,
    addAdmin,
    addAdmins,
    updateAdmin,
    deleteAdmin,
  };
}
