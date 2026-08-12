import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

// Admin-only: create a course + a default "General" module/lesson so materials
// can attach without a full curriculum builder (the enterprise "minimal now"
// pattern). RLS lets admins write; no service role needed.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const languageId = body?.languageId;
  const level = body?.level || null;
  const title = String(body?.title ?? "").trim();
  if (!languageId || !title) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: course, error } = await supabase
    .from("courses")
    .insert({ language_id: languageId, level, title, slug, mode: "live", is_published: true })
    .select("id")
    .single();
  if (error || !course) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 400 });

  const { data: mod } = await supabase
    .from("modules")
    .insert({ course_id: course.id, title: "General", position: 0 })
    .select("id")
    .single();
  if (mod) await supabase.from("lessons").insert({ module_id: mod.id, title: "General", position: 0 });

  return NextResponse.json({ ok: true, id: course.id });
}
