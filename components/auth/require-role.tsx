"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { AuthRole } from "@/lib/api/types";

type RequireRoleProps = {
  allowedRoles: readonly AuthRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RequireRole({ allowedRoles, children, fallback = null }: RequireRoleProps) {
  const { canAccess, loading } = useAuth();

  if (loading) {
    return fallback;
  }

  return canAccess(allowedRoles) ? children : fallback;
}
