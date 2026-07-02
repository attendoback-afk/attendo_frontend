"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Clock3, RefreshCw, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { closeLiveSession } from "@/services/live";
import {
  liveSessionKeys,
  useLiveQrToken,
  useLiveRecords,
  useLiveSession,
} from "@/hooks/useLiveSession";
import {
  formatLiveDateTime,
  LiveRecordsTable,
  LiveSessionSummaryGrid,
  LiveStatusBadge,
} from "@/components/live-session/live-session-parts";
import type { LiveQrPayload } from "@/types/live";

const REFRESH_SECONDS = 20;

export function LiveSessionRoom({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const academicSessionIdParam = searchParams.get("academicSessionId");
  const academicSessionId = academicSessionIdParam
    ? Number.parseInt(academicSessionIdParam, 10)
    : null;
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);
  const {
    data: liveSession,
    isLoading: sessionLoading,
    error: sessionError,
  } = useLiveSession(sessionId);
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useLiveRecords(sessionId);
  const closeMutation = useMutation({
    mutationFn: () => closeLiveSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: liveSessionKeys.mySessions() });
      void queryClient.invalidateQueries({ queryKey: liveSessionKeys.session(sessionId) });
      void queryClient.invalidateQueries({ queryKey: liveSessionKeys.records(sessionId) });
      void queryClient.invalidateQueries({ queryKey: liveSessionKeys.qr(sessionId) });
    },
  });

  const isActive =
    liveSession?.status === "ACTIVE" || recordsData?.session.status === "ACTIVE";
  const {
    data: qrToken,
    isLoading: qrLoading,
    error: qrError,
  } = useLiveQrToken(academicSessionId, isActive);
  const token = qrToken?.token ?? "";
  const qrPayload: LiveQrPayload | null =
    isActive && token ? { sessionId: String(academicSessionId ?? sessionId), token } : null;
  const summary = recordsData?.session;
  const records = recordsData?.records ?? [];

  useEffect(() => {
    if (!isActive) {
      setCountdown(0);
      return;
    }

    setCountdown(REFRESH_SECONDS);
    const timer = setInterval(() => {
      setCountdown((current) => (current <= 1 ? REFRESH_SECONDS : current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const error = sessionError ?? recordsError ?? qrError ?? closeMutation.error;

  return (
    <div className="dashboard-page">
      {error ? (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription>
            {error instanceof Error ? error.message : "Unable to load live session."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="dashboard-panel gap-0 py-0">
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Session Status</p>
                <div className="mt-2">
                  <LiveStatusBadge status={liveSession?.status ?? summary?.status} />
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Session ID</p>
                <p className="mt-2 max-w-[360px] truncate text-[14px] font-semibold text-foreground">
                  {sessionId}
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted-foreground">Started At</p>
                <p className="mt-2 text-[14px] font-semibold text-foreground">
                  {formatLiveDateTime(summary?.startTime ?? liveSession?.startTime)}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              className="rounded-lg"
              disabled={!isActive || closeMutation.isPending}
              onClick={() => closeMutation.mutate()}
            >
              <Square className="h-4 w-4" />
              {closeMutation.isPending ? "Closing..." : "Close Session"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-panel gap-0 py-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-[280px] w-full max-w-[280px] items-center justify-center rounded-lg border border-border bg-white p-5">
              {sessionLoading || qrLoading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : qrPayload ? (
                <QRCodeSVG
                  value={JSON.stringify(qrPayload)}
                  size={232}
                  level="M"
                  includeMargin
                />
              ) : (
                <RefreshCw className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="grid w-full max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
                <p className="text-[13px] font-medium text-muted-foreground">QR Token</p>
                <p className="mt-1 text-[24px] font-semibold tracking-normal text-foreground">
                  {token || "----"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-[#fcfbff] px-4 py-3">
                <p className="text-[13px] font-medium text-muted-foreground">Countdown</p>
                <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-[#93a6d7]" />
                  {isActive ? `Refreshing in ${countdown} sec` : "Refreshing paused"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary ? <LiveSessionSummaryGrid summary={summary} /> : null}

      <Card className="dashboard-panel gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          {recordsLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <LiveRecordsTable
              records={records}
              emptyMessage={
                isActive
                  ? "No attendance records yet."
                  : "No attendance records found for this session."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
