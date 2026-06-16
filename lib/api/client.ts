const TOKEN_STORAGE_KEY = "attendo_token";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_ATTENDO_API_URL ??
    "http://localhost:3000/api";
  const normalizedUrl = configuredUrl.replace(/\/$/, "");

  return normalizedUrl.endsWith("/api") ? normalizedUrl : `${normalizedUrl}/api`;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(TOKEN_STORAGE_KEY) ??
    window.sessionStorage.getItem(TOKEN_STORAGE_KEY) ??
    window.localStorage.getItem("token") ??
    window.sessionStorage.getItem("token") ??
    window.localStorage.getItem("accessToken") ??
    window.sessionStorage.getItem("accessToken")
  );
}

export function setAuthToken(token: string, remember = true) {
  if (typeof window === "undefined") {
    return;
  }

  const storage = remember ? window.localStorage : window.sessionStorage;
  clearAuthToken();
  storage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem("token");
  window.sessionStorage.removeItem("token");
  window.localStorage.removeItem("accessToken");
  window.sessionStorage.removeItem("accessToken");
}

function unwrapResponse<T>(data: unknown): T {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    return (record.data ?? record.result ?? record.item ?? record.items ?? data) as T;
  }

  return data as T;
}

async function parseResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAuthToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    body,
    headers: requestHeaders,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;

    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("attendo:unauthorized"));
      }
    }

    throw new ApiError(message, response.status, payload);
  }

  return unwrapResponse<T>(payload);
}

export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nested = record.data ?? record.items ?? record.results;

    if (Array.isArray(nested)) {
      return nested as T[];
    }
  }

  return [];
}

export function entityId(entity: { id?: string; _id?: string }) {
  return entity.id ?? entity._id ?? "";
}
