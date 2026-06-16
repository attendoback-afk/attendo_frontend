"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="dashboard-panel mx-auto w-full max-w-[540px] gap-0 overflow-hidden py-0">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#fff3f5]">
              <ShieldAlert className="h-6 w-6 text-[#ef8f9a]" />
            </div>
            <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.03em] text-foreground">
              Access denied
            </h1>
            <p className="mt-3 max-w-[420px] text-[15px] leading-7 text-muted-foreground">
              {user?.role
                ? `Your current role (${user.role}) does not have permission to access this area.`
                : "You do not have permission to access this area."}
            </p>
            {nextPath ? (
              <p className="mt-2 text-[13px] text-muted-foreground">
                Requested path: <span className="font-medium text-foreground">{nextPath}</span>
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-xl px-5">
                <Link href="/">Go to dashboard</Link>
              </Button>
              <Button type="button" variant="outline" className="h-11 rounded-xl px-5" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
