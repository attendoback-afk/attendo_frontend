"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getAccessibleHomeRoute, getRouteAccess, PUBLIC_PATHS } from "@/lib/auth";

const LOGIN_PATH = "/login";
const UNAUTHORIZED_PATH = "/unauthorized";

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]);
}

function AuthRouteGuardInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, loading, canAccess, error, refreshCurrentUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const access = useMemo(() => getRouteAccess(pathname), [pathname]);

  useEffect(() => {
    // 1. While auth is loading, show the loading UI and make no routing decisions.
    if (loading || status === "loading") {
      setChecking(true);
      return;
    }

    // 2. Public route handling (including special handling for /login when authenticated).
    if (access.public) {
      if (pathname === LOGIN_PATH && status === "authenticated") {
        const next = searchParams.get("next");

        if (next && next.startsWith("/")) {
          const nextAccess = getRouteAccess(next);
          const canGoToNext = nextAccess.public || !nextAccess.allowedRoles || canAccess(nextAccess.allowedRoles);
          const target = canGoToNext ? next : getAccessibleHomeRoute(user);

          if (target !== pathname) {
            router.replace(target);
            return;
          }
        } else {
          const target = getAccessibleHomeRoute(user);
          if (target !== pathname) {
            router.replace(target);
            return;
          }
        }
      }

      setChecking(false);
      return;
    }

    // 3. Protected route: if not authenticated, redirect to login once.
    if (!user || status !== "authenticated") {
      const loginTarget = `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`;
      if (loginTarget !== pathname) {
        router.replace(loginTarget);
        return;
      }
    }

    // 4. If authenticated and on the root path, redirect to the accessible home route.
    if (status === "authenticated" && pathname === "/") {
      const home = getAccessibleHomeRoute(user);
      if (home !== pathname) {
        router.replace(home);
        return;
      }
    }

    // 5. Role authorization check for protected routes.
    if (access.allowedRoles && access.allowedRoles.length > 0 && !canAccess(access.allowedRoles)) {
      const unauthTarget = `${UNAUTHORIZED_PATH}?next=${encodeURIComponent(pathname)}`;
      if (unauthTarget !== pathname) {
        router.replace(unauthTarget);
        return;
      }
    }

    // 6. No redirects necessary — allow rendering.
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

export function AuthRouteGuard({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="dashboard-panel px-6 py-5 text-sm text-muted-foreground">
            Checking session...
          </div>
        </div>
      }
    >
      <AuthRouteGuardInner>{children}</AuthRouteGuardInner>
    </Suspense>
  );
}

export { LOGIN_PATH, UNAUTHORIZED_PATH };
