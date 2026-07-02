import { apiRequest } from "@/lib/api/client";
import type {
  LiveQrToken,
  LiveSessionListItem,
  LiveSessionRecordsResponse,
  LiveSessionStart,
} from "@/types/live";

const json = (payload: unknown) => JSON.stringify(payload);

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
    const token = record.token ?? record.qrToken ?? record.secret;

    return {
      token: token ? String(token) : "",
      secret: record.secret ? String(record.secret) : undefined,
      expiresAt: record.expiresAt ? String(record.expiresAt) : undefined,
      expiresIn:
        typeof record.expiresIn === "number" ? record.expiresIn : undefined,
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
  academicSessionId: number,
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
