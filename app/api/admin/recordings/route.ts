import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Shared admin + tutor route: add a class recording to a session (the manual
// stand-in for the Zoom pipeline). The video never passes through this function —
// Vercel caps request bodies at ~4.5 MB — so it's a two-step flow:
//   action "sign"     → a signed upload URL into the private 'recordings' bucket;
//                        the browser uploads the file straight to Supabase Storage.
//   action "finalize" → inserts the recordings row marked 'ready'.
// Allowed for admins or the tutor of the session's batch.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const body = await req.json().catch(() => null);
  const action = body?.action;
  const sessionId = String(body?.sessionId ?? "");
  if (!sessionId || (action !== "sign" && action !== "finalize")) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  const { data: sess } = await svc
    .from("sessions")
    .select("title,starts_at,ends_at,batch:batches(tutor_id)")
    .eq("id", sessionId)
    .single();
  if (!sess) return NextResponse.json({ error: "bad_session" }, { status: 400 });
  const batchTutorId = (sess as unknown as { batch: { tutor_id: string | null } | null }).batch?.tutor_id;
  if (me?.role !== "admin" && batchTutorId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (action === "sign") {
    const rawExt = (String(body?.fileName ?? "").split(".").pop() || "").toLowerCase();
    const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "mp4";
    const path = `${sessionId}/${Date.now()}.${ext}`;
    const { data, error } = await svc.storage.from("recordings").createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: error?.message ?? "sign_failed" }, { status: 500 });
    return NextResponse.json({ path: data.path, token: data.token });
  }

  // finalize — the path must be one signed for this session.
  const path = String(body?.path ?? "");
  if (!path.startsWith(`${sessionId}/`) || path.includes("..")) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const title = String(body?.title ?? "").trim();
  const duration = sess.ends_at ? Math.round((Date.parse(sess.ends_at) - Date.parse(sess.starts_at)) / 60000) : null;

  const now = new Date().toISOString();
  const { error: insErr } = await svc.from("recordings").insert({
    session_id: sessionId,
    title: title || sess.title,
    storage_path: path,
    duration,
    status: "ready",
    synced_at: now,
    recorded_at: now,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
