import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { getServiceClient } from "@/lib/supabase";

// Admin: upload a material to a session → private 'resources' bucket + a
// resources row. Resolves the course's default lesson (creating one if needed)
// so the FK is satisfied without a curriculum builder.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const form = await req.formData();
  const file = form.get("file");
  const sessionId = String(form.get("sessionId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const type = String(form.get("type") ?? "");
  const description = String(form.get("description") ?? "").trim();
  if (!(file instanceof File) || !sessionId || !title || !["pdf", "audio", "video"].includes(type)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 });

  const svc = getServiceClient();
  if (!svc) return NextResponse.json({ error: "server_not_configured" }, { status: 500 });

  // Shared admin + tutor route: allow admins, or the tutor of this session's batch.
  const { data: sess } = await svc.from("sessions").select("batch:batches(course_id,tutor_id)").eq("id", sessionId).single();
  const batch = (sess as unknown as { batch: { course_id: string; tutor_id: string | null } | null } | null)?.batch;
  const courseId = batch?.course_id;
  if (!courseId) return NextResponse.json({ error: "bad_session" }, { status: 400 });
  if (me?.role !== "admin" && batch?.tutor_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Default module + lesson for the course (create if missing).
  const { data: mods } = await svc.from("modules").select("id").eq("course_id", courseId).order("position").limit(1);
  let moduleId = mods?.[0]?.id as string | undefined;
  if (!moduleId) {
    const { data: m } = await svc.from("modules").insert({ course_id: courseId, title: "General" }).select("id").single();
    moduleId = m?.id;
  }
  const { data: lessons } = await svc.from("lessons").select("id").eq("module_id", moduleId).order("position").limit(1);
  let lessonId = lessons?.[0]?.id as string | undefined;
  if (!lessonId && moduleId) {
    const { data: l } = await svc.from("lessons").insert({ module_id: moduleId, title: "General" }).select("id").single();
    lessonId = l?.id;
  }
  if (!lessonId) return NextResponse.json({ error: "no_lesson" }, { status: 500 });

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${courseId}/${sessionId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await svc.storage
    .from("resources")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream" });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { error: insErr } = await svc.from("resources").insert({
    lesson_id: lessonId,
    session_id: sessionId,
    type,
    title,
    description: description || null,
    storage_path: path,
    is_published: true,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
