"use client";

import { useCallback } from "react";
import { generateStrongPassword } from "@/lib/password";

export function usePasswordGenerator() {
  const createPassword = useCallback(() => generateStrongPassword(), []);

  return {
    createPassword,
  };
}
