// Retries a Supabase call once on transient network errors (e.g. DNS blips,
// connection resets) before giving up. Supabase JS returns { data, error }
// instead of throwing, so we retry when `error` looks network-related.
const isTransientNetworkError = (error) => {
  if (!error) return false;
  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("fetch failed") ||
    message.includes("enotfound") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("network")
  );
};

async function withRetry(fn, { attempts = 2, delayMs = 300 } = {}) {
  let lastResult;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    lastResult = await fn();
    const error = lastResult?.error;
    if (!error || !isTransientNetworkError(error)) {
      return lastResult;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return lastResult;
}

module.exports = { withRetry, isTransientNetworkError };
