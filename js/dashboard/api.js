import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from "../config/supabase.js";
const SESSION_KEY = "km-supabase-session-v1";
let activeSession = null;
let recoveryAccessToken = null;

export class SupabaseError extends Error {
  constructor(message, status = 0, payload = null) { super(message); this.name = "SupabaseError"; this.status = status; this.payload = payload; }
}
function headers(token, extra = {}) {
  return { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token || SUPABASE_PUBLISHABLE_KEY}`, ...extra };
}
async function request(path, options = {}) {
  if (!isSupabaseConfigured) throw new SupabaseError("Supabase is not configured.");
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: options.method || "GET",
    headers: headers(options.token, { ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await res.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }
  if (!res.ok) throw new SupabaseError(payload?.msg || payload?.message || payload?.error_description || payload?.error || `Supabase request failed (${res.status})`, res.status, payload);
  return payload;
}
export function saveSession(session) {
  activeSession = session;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export function clearSession() {
  activeSession = null;
  sessionStorage.removeItem(SESSION_KEY);
}
export function readSession() {
  if (activeSession) return activeSession;
  try { activeSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { activeSession = null; }
  return activeSession;
}
export async function freshSession() {
  const s = readSession();
  if (!s) return null;
  const exp = Number(s.expires_at || 0) * 1000;
  if (exp > Date.now() + 60_000) return s;
  if (!s.refresh_token) { clearSession(); return null; }
  try {
    const next = await request("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: s.refresh_token } });
    const session = { ...next, expires_at: Math.floor(Date.now() / 1000) + (next.expires_in || 3600) };
    saveSession(session);
    return session;
  } catch { clearSession(); return null; }
}
export async function passwordSignIn(email, password) {
  const result = await request("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
  const session = { ...result, expires_at: Math.floor(Date.now() / 1000) + (result.expires_in || 3600) };
  saveSession(session);
  return session;
}
export async function requestPasswordRecovery(email, redirectTo) {
  const path = `/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`;
  return request(path, { method: "POST", body: { email } });
}
export function takeRecoveryTokenFromUrl() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const token = params.get("access_token");
  if (params.get("type") !== "recovery" || !token) return false;
  recoveryAccessToken = token;
  history.replaceState(null, "", `${location.pathname}${location.search}`);
  clearSession();
  return true;
}
export async function completePasswordRecovery(password) {
  if (!recoveryAccessToken) throw new SupabaseError("This password reset link is invalid or has expired.", 401);
  await request("/auth/v1/user", { method: "PUT", token: recoveryAccessToken, body: { password } });
  recoveryAccessToken = null;
  clearSession();
}
export async function isAllowlisted(session) {
  if (!session?.user?.id) return false;
  const rows = await request(`/rest/v1/admin_allowlist?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`, { token: session.access_token });
  return Array.isArray(rows) && rows.some((x) => x.user_id === session.user.id);
}
export async function signOut() {
  const s = readSession();
  clearSession();
  if (s?.access_token) {
    try { await request("/auth/v1/logout?scope=global", { method: "POST", token: s.access_token }); } catch { /* local lock still takes effect */ }
  }
}
export async function dbRequest(path, options = {}) {
  let s = await freshSession();
  const token = options.token || s?.access_token;
  try { return await request(path, { ...options, token }); }
  catch (err) {
    if (err.status !== 401 || options.retry === false) throw err;
    s = await freshSession();
    if (!s) throw err;
    return request(path, { ...options, token: s.access_token, retry: false });
  }
}
export function publicRequest(path) { return request(path); }

export async function uploadImageDataUrl(dataUrl, objectName) {
  const s = await freshSession();
  if (!s?.access_token) throw new SupabaseError("Please sign in again before uploading.", 401);
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([a-z\d+/=]+)$/i.exec(dataUrl);
  if (!match) throw new SupabaseError("Image data is invalid.");
  const mime = match[1];
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  const ext = ({ "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif" })[mime];
  const clean = String(objectName || "portfolio-image").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").slice(0,90) || "portfolio-image";
  const path = `projects/${clean}-${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/portfolio-media/${path}`, {
    method: "POST",
    headers: headers(s.access_token, { "Content-Type": mime, "x-upsert": "false" }),
    body: bytes,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new SupabaseError(`Image upload failed: ${text.slice(0,180)}`, response.status);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/portfolio-media/${path}`;
}
