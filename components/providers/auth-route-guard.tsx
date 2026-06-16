"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getRouteAccess, PUBLIC_PATHS } from "@/lib/auth";

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]);
}

export function AuthRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, loading, canAccess, error, refreshCurrentUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const access = useMemo(() => getRouteAccess(pathname), [pathname]);

  useEffect(() => {
    if (loading || status === "loading") {
      setChecking(true);
      return;
    }

    if (access.public) {
      if (pathname === LOGIN_PATH && status === "authenticated") {
        const next = searchParams.get("next");
        router.replace(next && next.startsWith("/") ? next : "/");
        setChecking(true);
        return;
      }

      setChecking(false);
      return;
    }

    if (status === "error") {
      setChecking(false);
      return;
    }

    if (!user || status !== "authenticated") {
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
      setChecking(true);
      return;
    }

    if (access.allowedRoles && access.allowedRoles.length > 0 && !canAccess(access.allowedRoles)) {
      router.replace(`${UNAUTHORIZED_PATH}?next=${encodeURIComponent(pathname)}`);
      setChecking(true);
      return;
    }

    setChecking(false);
  }, [access.allowedRoles, access.public, canAccess, loading, pathname, router, searchParams, status, user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
          Checking session...
        </div>
      </div>
    );
  }

  if (status === "error" && !access.public) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="dashboard-panel w-full max-w-[520px] px-6 py-6 text-center">
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">
            Unable to verify your session
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
            {error ?? "We could not load your profile from /me. Please retry."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" className="rounded-xl" onClick={() => void refreshCurrentUser()}>
              Retry
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => router.replace(LOGIN_PATH)}
            >
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export { LOGIN_PATH, UNAUTHORIZED_PATH };
