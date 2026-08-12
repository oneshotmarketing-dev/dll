import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";
import { createMeeting, updateMeeting, deleteMeeting, zoomConfigured } from "@/lib/zoom";

export const runtime = "nodejs";

// Admin or the batch's own tutor: session mutations that must stay in sync with Zoom:
//   action "reschedule" → update the row + the Zoom meeting (time/title/topic)
//   action "status" → cancel deletes the Zoom meeting (kills the join link);
//                     restoring (scheduled) re-creates a fresh meeting.
// Replaces the old client-side sessions.update so Zoom never drifts from the DB.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = me?.role === "admin";

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const { data: sess } = await svc
    .from("sessions")
    .select("id,title,topic,zoom_meeting_id,batch_id,batch:batches(tutor_id)")
    .eq("id", params.id)
    .single();
  if (!sess) return NextResponse.json({ error: "not_found" }, { status: 404 });
  // Authorize admin OR the batch's own tutor.
  const batchTutorId = (sess as unknown as { batch: { tutor_id: string | null } | null }).batch?.tutor_id;
  if (!isAdmin && batchTutorId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === "reschedule") {
    const title = String(body?.title ?? "").trim();
    const starts_at = String(body?.starts_at ?? "");
    if (!title || !starts_at || Number.isNaN(Date.parse(starts_at))) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const ends_at = body?.ends_at && !Number.isNaN(Date.parse(body.ends_at)) ? String(body.ends_at) : null;
    const topic = body?.topic ? String(body.topic).trim() || null : null;
    const durationMin = ends_at ? Math.max(1, Math.round((Date.parse(ends_at) - Date.parse(starts_at)) / 60000)) : 120;

    if (sess.zoom_meeting_id && zoomConfigured()) {
      try {
        await updateMeeting(sess.zoom_meeting_id, { topic: title, startTime: starts_at, durationMin, agenda: topic ?? undefined });
      } catch (e) {
        return NextResponse.json({ error: "zoom_failed", detail: (e as Error).message }, { status: 502 });
      }
    }
    const { error } = await svc.from("sessions").update({ title, starts_at, ends_at, topic }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "status") {
    const status = body?.status;
    if (status !== "cancelled" && status !== "scheduled") {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    if (status === "cancelled") {
      if (sess.zoom_meeting_id && zoomConfigured()) {
        await deleteMeeting(sess.zoom_meeting_id).catch(() => {});
      }
      const { error } = await svc
        .from("sessions")
        .update({ status: "cancelled", zoom_meeting_id: null, zoom_start_url: null, join_url: null })
        .eq("id", params.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // Restore: re-create a meeting if the cancelled one was torn down.
    const patch: Record<string, unknown> = { status: "scheduled" };
    if (!sess.zoom_meeting_id && zoomConfigured()) {
      const { data: full } = await svc
        .from("sessions")
        .select("title,topic,starts_at,ends_at")
        .eq("id", params.id)
        .single();
      if (full?.starts_at) {
        const durationMin = full.ends_at
          ? Math.max(1, Math.round((Date.parse(full.ends_at) - Date.parse(full.starts_at)) / 60000))
          : 120;
        try {
          const m = await createMeeting({ topic: full.title, startTime: full.starts_at, durationMin, agenda: full.topic ?? undefined });
          patch.zoom_meeting_id = m.id;
          patch.zoom_start_url = m.start_url;
          patch.join_url = m.join_url;
        } catch (e) {
          return NextResponse.json({ error: "zoom_failed", detail: (e as Error).message }, { status: 502 });
        }
      }
    }
    const { error } = await svc.from("sessions").update(patch).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid_input" }, { status: 400 });
}
