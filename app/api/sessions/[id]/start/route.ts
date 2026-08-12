import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Start a class early: stamps actual_start = now so computeState flips the
// session to "live" before its scheduled starts_at — the teacher's attendance /
// End class actions appear immediately. Allowed for admins (any session) or the
// batch tutor (their own). No-op if already started; refused once the class has
// ended or been cancelled. Mirrors the /end route (the sole tutor-writable
// session paths, both via the service role since sessions_write is admin-only).
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

  if (sess.status === "cancelled") return NextResponse.json({ error: "cancelled" }, { status: 400 });
  if (sess.actual_start) return NextResponse.json({ ok: true }); // already started

  const now = Date.now();
  const end = sess.ends_at ? Date.parse(sess.ends_at) : Date.parse(sess.starts_at) + 2 * 3600_000;
  if (now > end) return NextResponse.json({ error: "already_ended" }, { status: 400 });

  const { error } = await svc
    .from("sessions")
    .update({ actual_start: new Date().toISOString(), status: "live" })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
