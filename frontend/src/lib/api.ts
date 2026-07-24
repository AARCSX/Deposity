// src/lib/api.ts

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Token Management ───────────────────────────────────────────
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("deposity_token");
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("deposity_token", token);
    } else {
      localStorage.removeItem("deposity_token");
    }
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("deposity_refresh_token");
  }
  return null;
}

export function setRefreshToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("deposity_refresh_token", token);
    } else {
      localStorage.removeItem("deposity_refresh_token");
    }
  }
}

// ─── Session Cleanup ─────────────────────────────────────────────
export function clearSession() {
  setAuthToken(null);
  setRefreshToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("oauth_code_verifier");
    localStorage.removeItem("oauth_state");
  }
}

// ─── Token Refresh ───────────────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Authenticated Fetch with Auto-Refresh ──────────────────────
export async function authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http") ? path : `${apiBase}${path.startsWith("/") ? "" : "/"}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // On 401, attempt silent token refresh and retry once
  if (response.status === 401) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request with the new token
      const newToken = getAuthToken();
      const retryHeaders = new Headers(options.headers || {});
      if (newToken) {
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
      }
      return fetch(url, { ...options, headers: retryHeaders });
    }

    // Refresh failed — session is dead, force re-login
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return response;
}

// ─── Org Name from Token ─────────────────────────────────────────
export function getOrgNameFromToken(): string {
  if (typeof window !== "undefined") {
    const overridden = localStorage.getItem("deposity_org_name");
    if (overridden) return overridden;
  }
  const token = getAuthToken();
  if (!token) return "OnWay";
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.org_name || "OnWay";
  } catch (e) {
    return "OnWay";
  }
}

// ─── Activity Logs API ────────────────────────────────────────────────
export async function fetchActivityLogs(params: {
  page?: number;
  limit?: number;
  category?: string;
  user_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.category && params.category !== "ALL") query.set("category", params.category);
  if (params.user_id) query.set("user_id", params.user_id);
  if (params.search) query.set("search", params.search);
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);

  const res = await authenticatedFetch(`/activity-logs?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch activity logs");
  return res.json();
}

export async function fetchActivityStats() {
  const res = await authenticatedFetch("/activity-logs/stats");
  if (!res.ok) throw new Error("Failed to fetch activity statistics");
  return res.json();
}

