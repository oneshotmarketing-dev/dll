import crypto from "crypto";

/**
 * Zoom Server-to-Server OAuth client (server-only). Powers admin meeting
 * creation (auto join links on the schedule) and the recording pipeline
 * (list/download/delete cloud recordings). Never import in a client component.
 *
 * Env: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_TEACHER_USER_ID,
 * ZOOM_WEBHOOK_SECRET. Missing creds throw a clear error so misconfig fails loud.
 */

const ZOOM_API = "https://api.zoom.us/v2";
const ZOOM_OAUTH = "https://zoom.us/oauth/token";

export function zoomConfigured(): boolean {
  return !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET);
}

// ─── S2S OAuth token (cached in module scope while the instance is warm) ──────
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) throw new Error("zoom_not_configured");

  // Reuse while >60s of life remains.
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) return cachedToken.value;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${ZOOM_OAUTH}?grant_type=account_credentials&account_id=${accountId}`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`zoom_oauth_failed_${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function zoomFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`${ZOOM_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export interface ZoomMeeting {
  id: string; // numeric meeting id, as string (Zoom returns a number)
  join_url: string;
  start_url: string;
}

/**
 * Create a scheduled cloud-recorded meeting under the teacher's licensed user.
 * startTime is an ISO instant; Zoom stores UTC when we pass timezone "UTC".
 */
export async function createMeeting(opts: {
  topic: string;
  startTime: string; // ISO
  durationMin: number;
  agenda?: string;
}): Promise<ZoomMeeting> {
  const host = process.env.ZOOM_TEACHER_USER_ID;
  if (!host) throw new Error("zoom_teacher_user_not_set");

  const res = await zoomFetch(`/users/${encodeURIComponent(host)}/meetings`, {
    method: "POST",
    body: JSON.stringify({
      topic: opts.topic.slice(0, 200),
      type: 2, // scheduled
      start_time: new Date(opts.startTime).toISOString().replace(/\.\d{3}Z$/, "Z"),
      duration: Math.max(1, Math.round(opts.durationMin)),
      timezone: "UTC",
      agenda: opts.agenda?.slice(0, 2000),
      settings: {
        auto_recording: "cloud",
        join_before_host: false,
        waiting_room: true,
        mute_upon_entry: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`zoom_create_meeting_failed_${res.status}: ${await res.text()}`);
  const m = (await res.json()) as { id: number; join_url: string; start_url: string };
  return { id: String(m.id), join_url: m.join_url, start_url: m.start_url };
}

export async function updateMeeting(
  meetingId: string,
  opts: { topic?: string; startTime?: string; durationMin?: number; agenda?: string },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (opts.topic != null) body.topic = opts.topic.slice(0, 200);
  if (opts.startTime != null) {
    body.start_time = new Date(opts.startTime).toISOString().replace(/\.\d{3}Z$/, "Z");
    body.timezone = "UTC";
  }
  if (opts.durationMin != null) body.duration = Math.max(1, Math.round(opts.durationMin));
  if (opts.agenda != null) body.agenda = opts.agenda.slice(0, 2000);

  const res = await zoomFetch(`/meetings/${meetingId}`, { method: "PATCH", body: JSON.stringify(body) });
  // 404 = meeting already gone; treat as success (nothing to keep in sync).
  if (!res.ok && res.status !== 404) throw new Error(`zoom_update_meeting_failed_${res.status}: ${await res.text()}`);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  const res = await zoomFetch(`/meetings/${meetingId}?schedule_for_reminder=false`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`zoom_delete_meeting_failed_${res.status}: ${await res.text()}`);
}

// ─── Recordings ────────────────────────────────────────────────────────────────
export interface ZoomRecordingFile {
  id: string;
  recording_type: string;
  file_type: string;
  file_extension: string;
  file_size: number;
  download_url: string;
}
export interface ZoomMeetingRecordings {
  uuid: string;
  duration: number; // minutes
  recording_files: ZoomRecordingFile[];
}

// A meeting instance UUID may contain '/' or '+' and must be double-encoded when
// it does (Zoom's documented quirk).
function encodeMeetingUuid(uuid: string): string {
  if (uuid.startsWith("/") || uuid.includes("//")) return encodeURIComponent(encodeURIComponent(uuid));
  return encodeURIComponent(uuid);
}

export async function getMeetingRecordings(meetingUuid: string): Promise<ZoomMeetingRecordings | null> {
  const res = await zoomFetch(`/meetings/${encodeMeetingUuid(meetingUuid)}/recordings`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`zoom_get_recordings_failed_${res.status}: ${await res.text()}`);
  return (await res.json()) as ZoomMeetingRecordings;
}

export async function deleteMeetingRecordings(meetingUuid: string): Promise<void> {
  // action=trash moves to Zoom's trash (recoverable ~30d); frees the 5GB quota.
  const res = await zoomFetch(`/meetings/${encodeMeetingUuid(meetingUuid)}/recordings?action=trash`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new Error(`zoom_delete_recordings_failed_${res.status}: ${await res.text()}`);
}

/**
 * Stream a recording file's bytes. Uses the S2S token (not the webhook's
 * short-lived download_token) so retries days later still work.
 */
export async function downloadRecordingStream(downloadUrl: string): Promise<Response> {
  const token = await getToken();
  const res = await fetch(`${downloadUrl}${downloadUrl.includes("?") ? "&" : "?"}access_token=${token}`);
  if (!res.ok || !res.body) throw new Error(`zoom_download_failed_${res.status}`);
  return res;
}

// ─── Webhook verification ───────────────────────────────────────────────────────
/** HMAC used both for the URL-validation handshake and event signature checks. */
function hmac(message: string): string {
  const secret = process.env.ZOOM_WEBHOOK_SECRET;
  if (!secret) throw new Error("zoom_webhook_secret_not_set");
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

/** Response body for Zoom's endpoint.url_validation challenge. */
export function webhookValidation(plainToken: string): { plainToken: string; encryptedToken: string } {
  return { plainToken, encryptedToken: hmac(plainToken) };
}

/** Verify an inbound event: signature = "v0=" + HMAC("v0:{ts}:{rawBody}"). */
export function verifyWebhook(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  if (!signature || !timestamp) return false;
  const expected = `v0=${hmac(`v0:${timestamp}:${rawBody}`)}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
