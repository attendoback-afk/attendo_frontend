"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLiveSessionUrl } from "@/services/live";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useLiveRecords,
  useMyLiveSessions,
} from "@/hooks/useLiveSession";
import {
  formatLiveDateTime,
  LiveRecordsTable,
  LiveSessionSummaryGrid,
  LiveStatusBadge,
} from "@/components/live-session/live-session-parts";

const RECENT_SESSION_LIMIT = 5;

export function LiveAttendanceSessionsSection() {
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const {
    data: sessions = [],
    isLoading,
    error,
  } = useMyLiveSessions();
  const {
    data: selectedRecords,
    isLoading: recordsLoading,
    error: recordsError,
  } = useLiveRecords(selectedSessionId);
  const recentSessions = sessions.slice(0, RECENT_SESSION_LIMIT);

  return (
    <section className="dashboard-page">
      <div>
        <h2 className="dashboard-section-title">Live Attendance Sessions</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Recent live sessions created by the current instructor.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription>
            {error instanceof Error ? error.message : "Unable to load live sessions."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="dashboard-panel gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Total Marked Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : recentSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No recent live sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                recentSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="max-w-[300px] truncate font-medium text-[#6f6a7e]">
                      {session.id}
                    </TableCell>
                    <TableCell>
                      <LiveStatusBadge status={session.status} />
                    </TableCell>
                    <TableCell>{formatLiveDateTime(session.startTime)}</TableCell>
                    <TableCell>{session._count?.markedAttendances ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          <Eye className="h-4 w-4" />
                          View Records
                        </Button>
                        {session.status === "ACTIVE" ? (
                          <Button asChild type="button" size="sm" className="rounded-lg">
                            <Link href={getLiveSessionUrl(session)}>
                              <Play className="h-4 w-4" />
                              Open Live Session
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSessionId ? (
        <Card className="dashboard-panel gap-0 py-0">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-[17px] font-semibold text-foreground">
                  Live Session Records
                </h3>
                <p className="mt-1 max-w-[520px] truncate text-[13px] text-muted-foreground">
                  {selectedSessionId}
                </p>
              </div>
            </div>

            {recordsError ? (
              <Alert variant="destructive" className="rounded-lg">
                <AlertDescription>
                  {recordsError instanceof Error
                    ? recordsError.message
                    : "Unable to load live session records."}
                </AlertDescription>
              </Alert>
            ) : null}

            {recordsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : selectedRecords ? (
              <>
                <LiveSessionSummaryGrid summary={selectedRecords.session} />
                <div className="overflow-hidden rounded-lg border border-border">
                  <LiveRecordsTable records={selectedRecords.records} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
