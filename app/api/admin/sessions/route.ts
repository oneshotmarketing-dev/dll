import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";
import { createMeeting, deleteMeeting, zoomConfigured } from "@/lib/zoom";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BULK = 100;

interface SessionInput {
  title: string;
  starts_at: string;
  ends_at: string | null;
  topic: string | null;
}

// Admin or the batch's own tutor: create one or many sessions for a batch. Each session gets a real
// Zoom meeting auto-created under the teacher's licensed host (cloud auto-record
// on), and the returned join_url / meeting id are stored on the row. Replaces the
// old client-side insert + manually-pasted Zoom link. The client always POSTs an
// array (length 1 for a single "Schedule session").
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  if (!zoomConfigured()) return NextResponse.json({ error: "zoom_not_configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const batchId = String(body?.batchId ?? "");
  const rawList = Array.isArray(body?.sessions) ? body.sessions : null;
  if (!batchId || !rawList || rawList.length === 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (rawList.length > MAX_BULK) return NextResponse.json({ error: "too_many" }, { status: 400 });

  // Normalize + validate each session.
  const items: SessionInput[] = [];
  for (const r of rawList) {
    const title = String(r?.title ?? "").trim();
    const starts_at = String(r?.starts_at ?? "");
    if (!title || !starts_at || Number.isNaN(Date.parse(starts_at))) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const ends_at = r?.ends_at && !Number.isNaN(Date.parse(r.ends_at)) ? String(r.ends_at) : null;
    items.push({ title, starts_at, ends_at, topic: r?.topic ? String(r.topic).trim() || null : null });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  // Batch must exist; authorize admin OR the batch's own tutor (a tutor may only
  // schedule for their own batch).
  const { data: batch } = await svc.from("batches").select("id,tutor_id").eq("id", batchId).single();
  if (!batch) return NextResponse.json({ error: "bad_batch" }, { status: 400 });
  if (!isAdmin && batch.tutor_id !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Create sequentially: one Zoom meeting per session, then insert the row. On
  // any failure we roll back the Zoom meeting we just made so no orphan meetings
  // are left behind, and report how many succeeded.
  let created = 0;
  for (const it of items) {
    const durationMin = it.ends_at
      ? Math.max(1, Math.round((Date.parse(it.ends_at) - Date.parse(it.starts_at)) / 60000))
      : 120;

    let meeting;
    try {
      meeting = await createMeeting({ topic: it.title, startTime: it.starts_at, durationMin, agenda: it.topic ?? undefined });
    } catch (e) {
      return NextResponse.json(
        { error: "zoom_failed", detail: (e as Error).message, created },
        { status: 502 },
      );
    }

    const { error: insErr } = await svc.from("sessions").insert({
      batch_id: batchId,
      title: it.title,
      starts_at: it.starts_at,
      ends_at: it.ends_at,
      topic: it.topic,
      provider: "zoom",
      status: "scheduled",
      join_url: meeting.join_url,
      zoom_meeting_id: meeting.id,
      zoom_start_url: meeting.start_url,
    });
    if (insErr) {
      // Roll back the just-created meeting so it doesn't dangle in Zoom.
      await deleteMeeting(meeting.id).catch(() => {});
      return NextResponse.json({ error: insErr.message, created }, { status: 500 });
    }
    created++;
  }

  return NextResponse.json({ ok: true, created });
}
