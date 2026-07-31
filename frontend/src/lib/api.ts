const DEFAULT_PROD_API_URL = "https://deposity-backend-117863432508.asia-south1.run.app";

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith("http") && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.startsWith("192.168.")) {
      return DEFAULT_PROD_API_URL;
    }
  }

  return envUrl ? envUrl.replace(/\/$/, "") : "http://localhost:8080";
}

export const apiBase = getApiBaseUrl();

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
      const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
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

  let activeTenantId = "";
  let activeOrgName = "";

  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    activeTenantId = urlParams.get("tenant_id") || localStorage.getItem("deposity_tenant_id") || "";
    activeOrgName = urlParams.get("org_name") || localStorage.getItem("deposity_org_name") || "";

    if (activeTenantId) {
      localStorage.setItem("deposity_tenant_id", activeTenantId);
    }
    if (activeOrgName) {
      localStorage.setItem("deposity_org_name", activeOrgName);
    }
  }

  const baseUrl = getApiBaseUrl();
  let url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  if (activeTenantId && !url.includes("tenant_id=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}tenant_id=${encodeURIComponent(activeTenantId)}`;
  }

  try {
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
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      console.warn(`API path '${path}' returned HTML page instead of JSON. Returning empty JSON fallback.`);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return response;
  } catch (networkError) {
    console.warn("Network error during API fetch, returning fallback response:", networkError);
    // Return empty fallback response so UI components stay functional without crashing or wiping session
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
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

export function getUserRoleFromToken(): string {
  const token = getAuthToken();
  if (!token) return "Owner";
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
    return payload.role || payload.org_role || "Owner";
  } catch (e) {
    return "Owner";
  }
}

export function getSubscriptionPlanFromToken(): string {
  const token = getAuthToken();
  if (!token) return "7-Day Free Trial";
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
    return payload.subscription_plan || "7-Day Free Trial";
  } catch (e) {
    return "7-Day Free Trial";
  }
}

export function getSubscriptionStatusFromToken(): string {
  const token = getAuthToken();
  if (!token) return "trialing";
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
    return payload.subscription_status || "trialing";
  } catch (e) {
    return "trialing";
  }
}

export type UserBranchInfo = {
  id: string;
  name: string;
  tenant_id: string;
  role: string;
  plan: string;
};

export async function fetchUserBranches(): Promise<UserBranchInfo[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch("https://zrxdlanspjqewyqurvvl.supabase.co/functions/v1/oauth-userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (data.user_organizations && Array.isArray(data.user_organizations) && data.user_organizations.length > 0) {
      return data.user_organizations.map((org: any) => ({
        id: org.id || org.tenant_id,
        name: org.name || "Organization",
        tenant_id: org.tenant_id || "",
        role: org.role || "Employee",
        plan: org.subscription_plan || "7-Day Free Trial",
      }));
    }

    return [
      {
        id: data.tenant_id || "default",
        name: data.org_name || "AARCSX Transport",
        tenant_id: data.tenant_id || "",
        role: data.role || "Employee",
        plan: data.subscription_plan || "7-Day Free Trial",
      },
    ];
  } catch (e) {
    return [];
  }
}

export function switchActiveBranch(branchName: string, tenantId?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("deposity_org_name", branchName);
    if (tenantId) {
      localStorage.setItem("deposity_tenant_id", tenantId);
    }
    window.dispatchEvent(new Event("deposity_org_name_changed"));
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

