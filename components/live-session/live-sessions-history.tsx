"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Play, Square } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { closeLiveSession, getLiveSessionUrl } from "@/services/live";
import {
  liveSessionKeys,
  useMyLiveSessions,
} from "@/hooks/useLiveSession";
import {
  formatLiveDateTime,
  LiveStatusBadge,
} from "@/components/live-session/live-session-parts";

export function LiveSessionsHistory() {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading, error } = useMyLiveSessions();

  const closeMutation = useMutation({
    mutationFn: (sessionId: string) => closeLiveSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: liveSessionKeys.mySessions() });
    },
  });

  return (
    <div className="dashboard-page">
      {error ? (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription>
            {error instanceof Error ? error.message : "Unable to load live sessions."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-end">
        <Button asChild type="button" variant="outline" className="rounded-lg">
          <Link href="/sessions">Start from scheduled sessions</Link>
        </Button>
      </div>

      <Card className="dashboard-panel gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#fcfbff]">
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Ended At</TableHead>
                <TableHead>Total Attendance</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No live sessions found.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const isActive = session.status === "ACTIVE";

                  return (
                    <TableRow key={session.id}>
                      <TableCell className="max-w-[260px] truncate font-medium text-[#6f6a7e]">
                        {session.id}
                      </TableCell>
                      <TableCell>
                        <LiveStatusBadge status={session.status} />
                      </TableCell>
                      <TableCell>{formatLiveDateTime(session.startTime)}</TableCell>
                      <TableCell>{formatLiveDateTime(session.endTime)}</TableCell>
                      <TableCell>{session._count?.markedAttendances ?? 0}</TableCell>
                      <TableCell>{formatLiveDateTime(session.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {isActive ? (
                            <>
                              <Button asChild type="button" variant="outline" size="sm" className="rounded-lg">
                                <Link href={getLiveSessionUrl(session)}>
                                  <Play className="h-4 w-4" />
                                  Open Live Session
                                </Link>
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-lg"
                                disabled={closeMutation.isPending}
                                onClick={() => closeMutation.mutate(session.id)}
                              >
                                <Square className="h-4 w-4" />
                                Close Session
                              </Button>
                            </>
                          ) : (
                            <Button asChild type="button" variant="outline" size="sm" className="rounded-lg">
                              <Link href={getLiveSessionUrl(session)}>
                                <Eye className="h-4 w-4" />
                                View Attendance
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
