// src/lib/api.ts

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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
  
  if (response.status === 401) {
    setAuthToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
  
  return response;
}
