import React from "react";
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

// ─── Currency ────────────────────────────────────────────────────────────────

export const CURRENCY_STORAGE_KEY = "sahel_currency";
export const DEFAULT_CURRENCY = "USD";
const RATE_CACHE_KEY = "sahel_fx_rate";
const RATE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const CURRENCY_SYMBOLS = {
  USD: "$", SOS: "Sh", KES: "KSh", ETB: "Br", TZS: "TSh",
  UGX: "USh", DJF: "Fr", SAR: "﷼", AED: "د.إ", GBP: "£",
  EUR: "€", TRY: "₺"
};

export function getSavedCurrency() {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return localStorage.getItem(CURRENCY_STORAGE_KEY) || DEFAULT_CURRENCY;
}

export function saveCurrency(currencyCode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
  // Clear cached rate so it refreshes for the new currency
  localStorage.removeItem(RATE_CACHE_KEY);
  window.dispatchEvent(new CustomEvent("sahel_currency_changed", { detail: currencyCode }));
}

// Returns cached rate or null if stale/missing
function getCachedRate(currency) {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || "null");
    if (!cached) return null;
    if (cached.currency !== currency) return null;
    if (Date.now() - cached.savedAt > RATE_CACHE_TTL) return null;
    return cached.rate;
  } catch {
    return null;
  }
}

function setCachedRate(currency, rate) {
  try {
    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({
      currency,
      rate,
      savedAt: Date.now()
    }));
  } catch {}
}

// In-memory rate for the current session (avoids repeated localStorage reads)
let _currentRate = 1;
let _currentCurrency = "USD";

export async function fetchExchangeRate(currency) {
  if (currency === "USD") {
    _currentRate = 1;
    _currentCurrency = "USD";
    return 1;
  }

  const cached = getCachedRate(currency);
  if (cached) {
    _currentRate = cached;
    _currentCurrency = currency;
    return cached;
  }

  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`);
    const data = await response.json();
    const rate = data?.rates?.[currency];
    if (rate) {
      setCachedRate(currency, rate);
      _currentRate = rate;
      _currentCurrency = currency;
      return rate;
    }
  } catch {
    // If fetch fails, fall back to 1 (show USD value with new symbol)
  }

  _currentRate = 1;
  _currentCurrency = currency;
  return 1;
}

// Hook: call once in Layout to keep currency + rate in sync across the app
export function useCurrency() {
  const [currency, setCurrency] = React.useState(getSavedCurrency);

  React.useEffect(() => {
    // Fetch rate for current currency on mount
    fetchExchangeRate(currency);

    function handleChange(event) {
      const newCurrency = event.detail;
      setCurrency(newCurrency);
      fetchExchangeRate(newCurrency).then(() => {
        // Trigger a re-render by dispatching a second event after rate is loaded
        window.dispatchEvent(new CustomEvent("sahel_rate_loaded"));
      });
    }

    window.addEventListener("sahel_currency_changed", handleChange);
    return () => window.removeEventListener("sahel_currency_changed", handleChange);
  }, []);

  // Also listen for rate_loaded to force re-render after async fetch completes
  React.useEffect(() => {
    function handleRateLoaded() {
      setCurrency(getSavedCurrency());
    }
    window.addEventListener("sahel_rate_loaded", handleRateLoaded);
    return () => window.removeEventListener("sahel_rate_loaded", handleRateLoaded);
  }, []);

  return currency;
}

export function formatMoney(value, currencyOverride) {
  const currency = currencyOverride || getSavedCurrency();
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const rate = (currency === _currentCurrency) ? _currentRate : 1;
  const converted = Number(value || 0) * rate;
  const formatted = new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(converted);
  return `${symbol}${formatted}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthISO() {
  return new Date().toISOString().slice(0, 7);
}

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

// Currency setting key — shared with Settings.jsx
export const CURRENCY_STORAGE_KEY = "sahel_currency";
export const DEFAULT_CURRENCY = "USD";

export function getSavedCurrency() {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return localStorage.getItem(CURRENCY_STORAGE_KEY) || DEFAULT_CURRENCY;
}

export function saveCurrency(currencyCode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
  // Dispatch an event so any open components re-render with the new currency
  window.dispatchEvent(new CustomEvent("sahel_currency_changed", { detail: currencyCode }));
}

// Hook: call once in a top-level component (e.g. Layout) to force re-render on currency change
export function useCurrency() {
  const [currency, setCurrency] = React.useState(getSavedCurrency);
  React.useEffect(() => {
    function handleChange(event) {
      setCurrency(event.detail);
    }
    window.addEventListener("sahel_currency_changed", handleChange);
    return () => window.removeEventListener("sahel_currency_changed", handleChange);
  }, []);
  return currency;
}

// Currency symbols for display
const CURRENCY_SYMBOLS = {
  USD: "$", SOS: "Sh", KES: "KSh", ETB: "Br", TZS: "TSh",
  UGX: "USh", DJF: "Fr", SAR: "﷼", AED: "د.إ", GBP: "£",
  EUR: "€", TRY: "₺"
};

export function formatMoney(value, currencyOverride) {
  const currency = currencyOverride || getSavedCurrency();
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const number = Number(value || 0);
  const formatted = new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
  return `${symbol}${formatted}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthISO() {
  return new Date().toISOString().slice(0, 7);
}
