const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Wraps a failed request in an Error whose `.message` is the backend's
 * message field, and (when present) attaches structured extra fields such as
 * `email` — used by the EMAIL_NOT_VERIFIED flow so the frontend redirects
 * with the account's real email instead of guessing from the username.
 */
function apiError(data, status) {
  const err = new Error(data?.message || "Request failed");
  if (data?.email) err.email = data.email;
  err.status = status;
  return err;
}

async function handle(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw apiError(data, response.status);
  return data;
}

/**
 * The browser's fetch() throws a plain TypeError with the message
 * "Failed to fetch" whenever the request never got a response at all —
 * backend not running, wrong port/URL, or a CORS preflight rejection. None
 * of those are "your password was wrong" style API errors, so surfacing the
 * raw browser message straight to the user is confusing. This wraps that
 * case with an actionable message instead.
 */
async function withNetworkErrorHandling(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof TypeError) {
      const err = new Error(
        `Could not reach the server at ${API_BASE}. Make sure the backend is running and that its CORS settings allow this origin (${window.location.origin}).`
      );
      err.networkError = true;
      throw err;
    }
    throw e;
  }
}

export async function post(path, body, token) {
  return withNetworkErrorHandling(async () => {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  });
}

export async function put(path, body, token) {
  return withNetworkErrorHandling(async () => {
    const res = await fetch(API_BASE + path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  });
}

export async function get(path, token) {
  return withNetworkErrorHandling(async () => {
    const res = await fetch(API_BASE + path, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    return handle(res);
  });
}

export const TOKEN_KEY = "mcrn_token";
