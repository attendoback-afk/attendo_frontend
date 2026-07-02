"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  closeLiveSession,
  getLiveQr,
  getMyLiveSessions,
  getLiveSessionRecords,
  startLiveSession,
} from "@/services/live";
import type {
  LiveAttendanceRecord,
  LiveSessionListItem,
  LiveSessionRecordsResponse,
  LiveSessionStart,
  LiveSessionSummary,
} from "@/types/live";

const REFRESH_INTERVAL_MS = 20000;
const REFRESH_INTERVAL_SECONDS = REFRESH_INTERVAL_MS / 1000;

export const liveSessionKeys = {
  all: ["live-sessions"] as const,
  mySessions: () => [...liveSessionKeys.all, "mine"] as const,
  session: (sessionId: string) =>
    [...liveSessionKeys.mySessions(), sessionId] as const,
  records: (sessionId: string) =>
    [...liveSessionKeys.all, "records", sessionId] as const,
  qr: (academicSessionId: string | number) =>
    [...liveSessionKeys.all, "qr", academicSessionId] as const,
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function useMyLiveSessions() {
  return useQuery({
    queryKey: liveSessionKeys.mySessions(),
    queryFn: ({ signal }) => getMyLiveSessions({ signal }),
    refetchInterval: (query) =>
      query.state.data?.some((session) => session.status === "ACTIVE")
        ? 10000
        : false,
  });
}

export function useLiveSession(sessionId: string) {
  return useQuery({
    queryKey: liveSessionKeys.session(sessionId),
    queryFn: ({ signal }) => getMyLiveSessions({ signal }),
    enabled: Boolean(sessionId),
    select: (sessions: LiveSessionListItem[]) =>
      sessions.find((session) => session.id === sessionId) ?? null,
    refetchInterval: (query) =>
      query.state.data?.some(
        (session) => session.id === sessionId && session.status === "ACTIVE",
      )
        ? REFRESH_INTERVAL_MS
        : false,
  });
}

export function useLiveRecords(sessionId: string) {
  return useQuery({
    queryKey: liveSessionKeys.records(sessionId),
    queryFn: ({ signal }) => getLiveSessionRecords(sessionId, { signal }),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      query.state.data?.session.status === "ACTIVE" ? REFRESH_INTERVAL_MS : false,
  });
}

export function useLiveQrToken(
  academicSessionId: string | number | null,
  active = true,
) {
  return useQuery({
    queryKey: liveSessionKeys.qr(academicSessionId ?? "missing"),
    queryFn: ({ signal }) => getLiveQr(academicSessionId ?? "missing", { signal }),
    enabled: Boolean(academicSessionId) && active,
    refetchInterval: active ? REFRESH_INTERVAL_MS : false,
  });
}

export function useLiveSessionController() {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSessionStart | null>(null);
  const [records, setRecords] = useState<LiveAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<LiveSessionSummary | null>(null);
  const [secret, setSecret] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const activeRef = useRef(false);
  const sessionIdRef = useRef("");
  const academicSessionIdRef = useRef<string | number | null>(null);
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllersRef = useRef(new Set<AbortController>());
  const qrInFlightRef = useRef(false);
  const recordsInFlightRef = useRef(false);

  const createController = useCallback(() => {
    const controller = new AbortController();
    controllersRef.current.add(controller);

    return controller;
  }, []);

  const releaseController = useCallback((controller: AbortController) => {
    controllersRef.current.delete(controller);
  }, []);

  const abortPendingRequests = useCallback(() => {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
  }, []);

  const clearTimers = useCallback(() => {
    if (qrTimerRef.current) {
      clearInterval(qrTimerRef.current);
      qrTimerRef.current = null;
    }

    if (recordsTimerRef.current) {
      clearInterval(recordsTimerRef.current);
      recordsTimerRef.current = null;
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const applyStartedSession = useCallback((session: LiveSessionStart) => {
    activeRef.current = true;
    sessionIdRef.current = session.sessionId;
    academicSessionIdRef.current = session.academicSessionId;
    setActiveSession(session);
    setSessionId(session.sessionId);
    setSecret(session.secret ?? "");
    setStartTime(session.startTime);
    setCountdown(REFRESH_INTERVAL_SECONDS);
    setClosed(false);
  }, []);

  const readErrorMessage = useCallback((requestError: unknown, fallback: string) => {
    if (isAbortError(requestError)) {
      return null;
    }

    return requestError instanceof Error ? requestError.message : fallback;
  }, []);

  const refreshQrCode = useCallback(async () => {
    const currentAcademicSessionId = academicSessionIdRef.current;

    if (!activeRef.current || !currentAcademicSessionId || qrInFlightRef.current) {
      return;
    }

    qrInFlightRef.current = true;
    const controller = createController();

    try {
      const qr = await getLiveQr(currentAcademicSessionId, {
        signal: controller.signal,
      });
      setSecret(qr.token);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    } catch (refreshError) {
      const message = readErrorMessage(refreshError, "Unable to refresh the QR code.");

      if (message) {
        setError(message);
      }
    } finally {
      qrInFlightRef.current = false;
      releaseController(controller);
    }
  }, [createController, readErrorMessage, releaseController]);

  const loadRecords = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;

    if (!activeRef.current || !currentSessionId || recordsInFlightRef.current) {
      return;
    }

    recordsInFlightRef.current = true;
    const controller = createController();

    try {
      const data: LiveSessionRecordsResponse = await getLiveSessionRecords(
        currentSessionId,
        { signal: controller.signal },
      );

      setSummary(data.session);
      setRecords(data.records);
    } catch (recordsError) {
      const message = readErrorMessage(recordsError, "Unable to load attendance records.");

      if (message) {
        setError(message);
      }
    } finally {
      recordsInFlightRef.current = false;
      releaseController(controller);
    }
  }, [createController, readErrorMessage, releaseController]);

  const startTimers = useCallback(() => {
    clearTimers();

    qrTimerRef.current = setInterval(() => {
      void refreshQrCode();
    }, REFRESH_INTERVAL_MS);

    recordsTimerRef.current = setInterval(() => {
      void loadRecords();
    }, REFRESH_INTERVAL_MS);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((current) =>
        current <= 1 ? REFRESH_INTERVAL_SECONDS : current - 1,
      );
    }, 1000);
  }, [clearTimers, loadRecords, refreshQrCode]);

  const startSession = useCallback(async (sourceSessionId?: string) => {
    if (!sourceSessionId) {
      setError("Select a scheduled session before starting live attendance.");
      return;
    }

    clearTimers();
    abortPendingRequests();
    activeRef.current = false;
    sessionIdRef.current = "";
    academicSessionIdRef.current = null;
    setLoading(true);
    setError(null);
    setClosed(false);
    setRecords([]);
    setSummary(null);

    const controller = createController();

    try {
      const session = await startLiveSession(sourceSessionId, {
        signal: controller.signal,
      });
      applyStartedSession(session);
      startTimers();
      void loadRecords();
    } catch (startError) {
      const message = readErrorMessage(startError, "Unable to start the live session.");

      if (message) {
        setError(message);
      }
    } finally {
      releaseController(controller);
      setLoading(false);
    }
  }, [
    abortPendingRequests,
    applyStartedSession,
    clearTimers,
    createController,
    loadRecords,
    readErrorMessage,
    releaseController,
    startTimers,
  ]);

  const closeSession = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;

    if (!currentSessionId) {
      return;
    }

    setClosing(true);
    setError(null);
    clearTimers();
    activeRef.current = false;
    abortPendingRequests();

    const controller = createController();

    try {
      await closeLiveSession(currentSessionId, { signal: controller.signal });
      setClosed(true);
      setSecret("");
      setCountdown(0);
      setSummary((current) =>
        current
          ? {
              ...current,
              status: "CLOSED",
              endTime: current.endTime ?? new Date().toISOString(),
            }
          : current,
      );
    } catch (closeError) {
      const message = readErrorMessage(closeError, "Unable to close the live session.");

      if (message) {
        setError(message);
        activeRef.current = true;
        startTimers();
      }
    } finally {
      releaseController(controller);
      setClosing(false);
    }
  }, [
    abortPendingRequests,
    clearTimers,
    createController,
    readErrorMessage,
    releaseController,
    startTimers,
  ]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      academicSessionIdRef.current = null;
      clearTimers();
      abortPendingRequests();
    };
  }, [abortPendingRequests, clearTimers]);

  return {
    loading,
    closing,
    activeSession,
    records,
    summary,
    secret,
    sessionId,
    startTime,
    countdown,
    error,
    closed,
    isActive: Boolean(activeSession) && !closed,
    startSession,
    closeSession,
  };
}
