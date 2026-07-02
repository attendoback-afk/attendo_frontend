import { apiRequest } from "@/lib/api/client";
import type {
  LiveQrToken,
  LiveSessionListItem,
  LiveSessionRecordsResponse,
  LiveSessionStart,
  LiveSessionSummary,
} from "@/types/live";

const json = (payload: unknown) => JSON.stringify(payload);

type LiveSessionWithAcademicId = Pick<
  LiveSessionListItem | LiveSessionSummary | LiveSessionStart,
  "academicSessionId"
> & {
  sessionId?: string | number;
  academicSession?: {
    id?: string | number;
  } | null;
};

function presentId(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized ? normalized : null;
}

export function getAcademicSessionId(
  session: LiveSessionWithAcademicId | null | undefined,
) {
  if (!session) {
    return null;
  }

  return (
    presentId(session.academicSessionId) ??
    presentId(session.academicSession?.id) ??
    presentId(session.sessionId)
  );
}

export function getLiveSessionUrl(session: LiveSessionListItem | LiveSessionStart) {
  const params = new URLSearchParams();
  const academicSessionId = getAcademicSessionId(session);
  const attendanceSessionId = "id" in session ? session.id : session.sessionId;

  if (academicSessionId) {
    params.set("academicSessionId", academicSessionId);
  }

  const query = params.toString();

  return `/sessions/live/${encodeURIComponent(String(attendanceSessionId))}${
    query ? `?${query}` : ""
  }`;
}

export function startLiveSession(
  sessionId: string,
  options: { signal?: AbortSignal } = {},
) {
  return apiRequest<LiveSessionStart>("/live/start", {
    method: "POST",
    body: json({ sessionId }),
    signal: options.signal,
  });
}

export async function getMyLiveSessions(options: { signal?: AbortSignal } = {}) {
  const sessions = await apiRequest<LiveSessionListItem[]>("/live/my-sessions", {
    method: "GET",
    signal: options.signal,
  });

  return [...sessions].sort(
    (left, right) =>
      new Date(right.startTime || right.createdAt).getTime() -
      new Date(left.startTime || left.createdAt).getTime(),
  );
}

function normalizeQrToken(payload: unknown): LiveQrToken {
  if (typeof payload === "string") {
    return { token: payload };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedQr =
      record.qr && typeof record.qr === "object"
        ? (record.qr as Record<string, unknown>)
        : null;
    const token =
      record.token ??
      record.qrToken ??
      record.secret ??
      record.code ??
      nestedQr?.token ??
      nestedQr?.qrToken ??
      nestedQr?.secret;
    const expiresAt = record.expiresAt ?? nestedQr?.expiresAt;
    const expiresIn = record.expiresIn ?? nestedQr?.expiresIn;

    return {
      token: token ? String(token) : "",
      secret: record.secret ? String(record.secret) : undefined,
      expiresAt: expiresAt ? String(expiresAt) : undefined,
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
    };
  }

  return { token: "" };
}

export function closeLiveSession(
  sessionId: string,
  options: { signal?: AbortSignal } = {},
) {
  return apiRequest<void>("/live/close", {
    method: "POST",
    body: json({ sessionId }),
    signal: options.signal,
  });
}

export function getLiveSessionRecords(
  sessionId: string,
  options: { signal?: AbortSignal } = {},
) {
  return apiRequest<LiveSessionRecordsResponse>(
    `/live/${encodeURIComponent(sessionId)}/records`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

export async function getLiveQr(
  academicSessionId: string | number,
  options: { signal?: AbortSignal } = {},
) {
  const payload = await apiRequest<unknown>(
    `/live/${encodeURIComponent(String(academicSessionId))}/qr`,
    {
      method: "GET",
      signal: options.signal,
    },
  );

  return normalizeQrToken(payload);
}
