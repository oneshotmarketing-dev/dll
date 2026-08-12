import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getServiceClient } from "@/lib/supabase";
import { verifyWebhook, webhookValidation } from "@/lib/zoom";

export const runtime = "nodejs";

// Zoom webhook receiver. Must ack within ~3s, so it does no heavy work: it
// verifies the event, maps recording.completed → the matching session, and
// inserts a 'processing' recording row, then event-drives the transfer by
// pinging the zoom-transfer worker (via waitUntil, so the 200 returns instantly).
// The cron is now just a low-frequency retry net. Idempotent via the unique
// index on recordings.zoom_recording_id (phase0g) — duplicate deliveries no-op.
export async function POST(req: Request) {
  const raw = await req.text();
  let event: { event?: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // 1) URL-validation handshake (no signature check needed here).
  if (event.event === "endpoint.url_validation") {
    const plainToken = String((event.payload as { plainToken?: string })?.plainToken ?? "");
    return NextResponse.json(webhookValidation(plainToken));
  }

  // 2) Verify every other event's signature.
  if (!verifyWebhook(raw, req.headers.get("x-zm-signature"), req.headers.get("x-zm-request-timestamp"))) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  if (event.event !== "recording.completed") {
    return NextResponse.json({ ok: true }); // ack + ignore other events
  }

  const obj = (event.payload as { object?: Record<string, unknown> })?.object ?? {};
  const meetingId = obj.id != null ? String(obj.id) : "";
  const meetingUuid = String(obj.uuid ?? ""); // instance uuid → idempotency key + worker handle
  console.log("[zoom-webhook] recording.completed", { meetingId, meetingUuid, topic: obj.topic });
  if (!meetingId || !meetingUuid) return NextResponse.json({ ok: true });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  // Map to our session. Unknown meeting (not created by us) → ack + ignore.
  const { data: session } = await svc
    .from("sessions")
    .select("id,title")
    .eq("zoom_meeting_id", meetingId)
    .maybeSingle();
  if (!session) {
    console.warn("[zoom-webhook] no session matched meeting", meetingId);
    return NextResponse.json({ ok: true });
  }
  console.log("[zoom-webhook] enqueuing recording", { sessionId: session.id, meetingId });

  // Enqueue a processing row. On the unique-index conflict (dup webhook) it's a
  // no-op — already enqueued/handled, so ack without re-triggering the worker.
  const { error } = await svc.from("recordings").insert({
    session_id: session.id,
    title: (obj.topic as string) || session.title,
    status: "processing",
    zoom_recording_id: meetingUuid, // meeting instance uuid — the worker's handle
    recorded_at: (obj.start_time as string) ?? null,
  });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true }); // duplicate delivery
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fresh row → event-drive the transfer now (don't wait for the cron poll). The
  // transfer worker runs as its own 300s invocation; waitUntil keeps this handler
  // alive just long enough to dispatch the request while the 200 returns to Zoom.
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host");
  if (host) {
    waitUntil(
      fetch(`${proto}://${host}/api/cron/zoom-transfer`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
      }).catch(() => {}),
    );
  }

  return NextResponse.json({ ok: true });
}
