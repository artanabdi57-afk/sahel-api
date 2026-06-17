import { clearSession, getToken } from "./auth";
import { Capacitor } from "@capacitor/core";

const queryApiBaseUrl =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("apiBaseUrl") : null;

if (queryApiBaseUrl) {
  localStorage.setItem("sahel_api_base_url", queryApiBaseUrl);
}

const savedApiBaseUrl = typeof window !== "undefined" ? localStorage.getItem("sahel_api_base_url") : null;
const isCapacitorApp =
  typeof window !== "undefined" &&
  (window.location.protocol === "capacitor:" || Capacitor.isNativePlatform());
const mobileApiBaseUrl = "http://10.255.1.169:3000/api";
const usableSavedApiBaseUrl = isCapacitorApp && savedApiBaseUrl === "/api" ? null : savedApiBaseUrl;

function normalizeApiBaseUrl(value) {
  if (!value) return value;
  const trimmed = String(value).replace(/\/+$/, "");

  if (trimmed === "/api" || trimmed.endsWith("/api")) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return `${trimmed}/api`;
  }

  return trimmed;
}

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    queryApiBaseUrl ||
    (isCapacitorApp ? mobileApiBaseUrl : null) ||
    usableSavedApiBaseUrl ||
    (typeof window !== "undefined" && window.location.hostname === "127.0.0.1" && window.location.port !== "5173"
      ? "http://localhost:3000/api"
      : "/api")
);

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`API returned a web page instead of data. Check API URL: ${API_BASE_URL}`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    }

    throw new Error(body?.message || "Request failed");
  }

  return body;
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthISO() {
  return new Date().toISOString().slice(0, 7);
}
