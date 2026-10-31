const configuredApiUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).trim().replace(/\/+$/, "");

export const API_ORIGIN = configuredApiUrl.replace(/\/api$/i, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}

export function apiBaseUrl() {
  return apiUrl("/api");
}

export function installApiFetch() {
  if (window.__mcrnApiFetchInstalled) return;
  window.__mcrnApiFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const requestUrl = input instanceof Request ? input.url : String(input);
    const resolvedUrl = new URL(requestUrl, window.location.href);
    const isApiRequest = resolvedUrl.pathname === "/api" || resolvedUrl.pathname.startsWith("/api/");

    if (isApiRequest && API_ORIGIN && resolvedUrl.origin === window.location.origin) {
      resolvedUrl.protocol = new URL(API_ORIGIN).protocol;
      resolvedUrl.host = new URL(API_ORIGIN).host;
    }

    const pathname = resolvedUrl.pathname;
    const isAdminApi = pathname.startsWith("/api/admin/");
    const isNotificationApi = pathname === "/api/notifications";
    const isAdminPublicEndpoint = [
      "/api/admin/login",
      "/api/admin/forgot-password",
      "/api/admin/request-reset",
      "/api/admin/reset-password",
    ].some((endpoint) => pathname === endpoint);
    const isAuthPublicEndpoint = pathname.startsWith("/api/auth/") &&
      ["/api/auth/login", "/api/auth/police/login", "/api/auth/register/user",
        "/api/auth/register/police", "/api/auth/verify-email",
        "/api/auth/resend-otp", "/api/auth/forgot-password",
        "/api/auth/reset-password"].includes(pathname);

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    const token = isAdminApi
      ? (!isAdminPublicEndpoint && localStorage.getItem("adminToken"))
      : (!isAuthPublicEndpoint && localStorage.getItem("mcrn_token"));
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const requestInit = { ...init, headers };
    const response = input instanceof Request
      ? await nativeFetch(new Request(resolvedUrl.href, input), requestInit)
      : await nativeFetch(resolvedUrl.href, requestInit);

    if (response.status === 401 && isApiRequest && token) {
      if (isAdminApi) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminData");
        window.location.assign("/admin");
      } else if (isNotificationApi) {
        const payload = await response.clone().json().catch(() => null);
        const authMessage = [payload?.message, payload?.error, payload?.code]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (/(invalid|expired).*(session|token|jwt)|(session|token|jwt).*(invalid|expired)/.test(authMessage)) {
          localStorage.removeItem("mcrn_token");
          localStorage.removeItem("mcrn_session");
          window.location.assign("/login");
        }
      } else {
        localStorage.removeItem("mcrn_token");
        localStorage.removeItem("mcrn_session");
        window.location.assign("/login");
      }
    }

    return response;
  };
}

if (typeof window !== "undefined") {
  window.__mcrnApiFetchInstalled = false;
}
