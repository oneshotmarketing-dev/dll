import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// End a live class early: truncates ends_at to now so computeState reads the
// session as ended everywhere at once — the student's Join button disappears,
// the class moves to Past, and recording upload opens. Allowed for admins (any
// session) or the batch tutor (their own), and only while the class is actually
// in progress. Uses the service role because phase0f locked sessions_write to
// admins; this narrow route is the sole tutor-writable path and can only end a
// live session — never create or reschedule one.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const { data: sess } = await svc
    .from("sessions")
    .select("id,starts_at,ends_at,status,actual_start,batch:batches(tutor_id)")
    .eq("id", params.id)
    .single();
  if (!sess) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Authorize: admin (any session) or the tutor who owns this session's batch.
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const batchTutorId = (sess as unknown as { batch: { tutor_id: string | null } | null }).batch?.tutor_id;
  if (me?.role !== "admin" && batchTutorId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Only a class that is actually in progress can be ended early. It's in
  // progress if it was manually started (actual_start) OR its scheduled start has
  // passed. Before either → cancel it instead; already past its end → nothing to do.
  const now = Date.now();
  const start = Date.parse(sess.starts_at);
  const end = sess.ends_at ? Date.parse(sess.ends_at) : start + 2 * 3600_000;
  if (sess.status === "cancelled") return NextResponse.json({ error: "cancelled" }, { status: 400 });
  if (!sess.actual_start && now < start) return NextResponse.json({ error: "not_started" }, { status: 400 });
  if (now > end) return NextResponse.json({ error: "already_ended" }, { status: 400 });

  const { error } = await svc
    .from("sessions")
    .update({ ends_at: new Date().toISOString(), status: "ended" })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
